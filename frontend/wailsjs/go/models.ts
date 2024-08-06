export namespace db {
	
	export class GmailAccount {
	
	
	    static createFrom(source: any = {}) {
	        return new GmailAccount(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

export namespace vm {
	
	export class VMWareStatus {
	    vmrun_exists: boolean;
	    vmware_exists: boolean;
	    vm_folder_exists: boolean;
	
	    static createFrom(source: any = {}) {
	        return new VMWareStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.vmrun_exists = source["vmrun_exists"];
	        this.vmware_exists = source["vmware_exists"];
	        this.vm_folder_exists = source["vm_folder_exists"];
	    }
	}

}

