//go:build !windows

package main

import (
	"os"
	"syscall"
)

var trappedSignals = []os.Signal{
	syscall.SIGINT,
	syscall.SIGTERM,
	syscall.SIGHUP,
	syscall.SIGQUIT,
	syscall.SIGUSR1,
	syscall.SIGUSR2,
}
