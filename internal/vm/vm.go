// vm.go

package vm

import (
	"context"
	"go.uber.org/zap"
	"os"
	"path/filepath"
)

type VM struct {
	ctx    context.Context
	logger *zap.Logger
}

type VMWareStatus struct {
	VmrunExists    bool `json:"vmrun_exists"`
	VmwareExists   bool `json:"vmware_exists"`
	VmFolderExists bool `json:"vm_folder_exists"`
}

func VMMain(logger *zap.Logger) *VM {
	return &VM{logger: logger}
}

func (v *VM) CheckVMWareStatus() VMWareStatus {
	vmrunPath := "C:\\Program Files (x86)\\VMware\\VMware Workstation\\vmrun.exe"
	vmwarePath := "C:\\Program Files (x86)\\VMware\\VMware Workstation\\vmware.exe"
	vmFolder := filepath.Join(os.Getenv("USERPROFILE"), "Documents", "Virtual Machines")

	_, vmrunErr := os.Stat(vmrunPath)
	_, vmwareErr := os.Stat(vmwarePath)
	_, vmFolderErr := os.Stat(vmFolder)

	vmrunExists := !os.IsNotExist(vmrunErr)
	vmwareExists := !os.IsNotExist(vmwareErr)
	vmFolderExists := !os.IsNotExist(vmFolderErr)

	v.logger.Info("VMWare paths checked",
		zap.Bool("vmrun_exists", vmrunExists),
		zap.Bool("vmware_exists", vmwareExists),
		zap.Bool("vm_folder_exists", vmFolderExists))

	return VMWareStatus{
		VmrunExists:    vmrunExists,
		VmwareExists:   vmwareExists,
		VmFolderExists: vmFolderExists,
	}
}
