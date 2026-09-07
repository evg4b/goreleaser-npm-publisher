//go:build windows

package main

import (
	"os"
	"syscall"
)

// Windows delivers no other signal: the runtime raises SIGINT for Ctrl+C and Ctrl+Break, and
// SIGTERM when the console closes or the session ends.
var trappedSignals = []os.Signal{
	syscall.SIGINT,
	syscall.SIGTERM,
}
