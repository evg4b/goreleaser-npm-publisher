//go:build windows

package main

import (
	"os"
	"syscall"
)

var trappedSignals = []os.Signal{
	syscall.SIGINT,
	syscall.SIGTERM,
}
