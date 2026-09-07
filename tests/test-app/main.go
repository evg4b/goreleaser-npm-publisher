package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"
)

const idleTimeout = 2 * time.Minute

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
