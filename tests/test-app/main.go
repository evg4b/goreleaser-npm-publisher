package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"
)

// Bounds the lifetime of the waiting modes: on Windows a terminated wrapper orphans its binary.
const idleTimeout = 2 * time.Minute

// Long enough for a second delivery of the same signal to show up, short enough not to drag.
const settleDelay = 300 * time.Millisecond

func main() {
	switch command() {
	case "wait":
		waitForSignal()
	case "sleep":
		fmt.Println("ready")
		time.Sleep(idleTimeout)
	default:
		println("Ba dum, tss!")
	}
}

func command() string {
	if len(os.Args) < 2 {
		return ""
	}

	return os.Args[1]
}

// Reports every signal it is sent by number, so a test can compare them with os.constants.signals
// and see whether one arrived twice.
func waitForSignal() {
	received := make(chan os.Signal, 8)
	signal.Notify(received, trappedSignals...)

	fmt.Println("ready")
	select {
	case signal := <-received:
		report(signal)
	case <-time.After(idleTimeout):
		fmt.Println("timed out")
		os.Exit(9)
	}

	count := 1
	for {
		select {
		case signal := <-received:
			report(signal)
			count++
		case <-time.After(settleDelay):
			fmt.Printf("total %d\n", count)
			os.Exit(7)
		}
	}
}

func report(signal os.Signal) {
	fmt.Printf("received %d\n", signal.(syscall.Signal))
}
