export namespace browser {
	
	export class Account {
	    website: string;
	    username: string;
	    password: string;
	
	    static createFrom(source: any = {}) {
	        return new Account(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.website = source["website"];
	        this.username = source["username"];
	        this.password = source["password"];
	    }
	}
	export class Cookie {
	    name: string;
	    value: string;
	
	    static createFrom(source: any = {}) {
	        return new Cookie(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.value = source["value"];
	    }
	}
	export class CreateProfileRequest {
	    name: string;
	    os: string;
	    browser: string;
	    cpu: number;
	    memory: number;
	    tags: string[];
	    geolocation: string;
	    resolution: string;
	    proxy: string;
	    notes: string;
	    folder: string;
	    language: string;
	    cookies: Cookie[];
	    accounts: Account[];
	    type: string;
	    group: string;
	    configid: string;
	    timezone: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateProfileRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.os = source["os"];
	        this.browser = source["browser"];
	        this.cpu = source["cpu"];
	        this.memory = source["memory"];
	        this.tags = source["tags"];
	        this.geolocation = source["geolocation"];
	        this.resolution = source["resolution"];
	        this.proxy = source["proxy"];
	        this.notes = source["notes"];
	        this.folder = source["folder"];
	        this.language = source["language"];
	        this.cookies = this.convertValues(source["cookies"], Cookie);
	        this.accounts = this.convertValues(source["accounts"], Account);
	        this.type = source["type"];
	        this.group = source["group"];
	        this.configid = source["configid"];
	        this.timezone = source["timezone"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Profile {
	    name: string;
	    status: string;
	    debug_port: string;
	    websocket_link: string;
	    folder: string;
	    tags: string[];
	    cloud_id: string;
	    creation_date: number;
	    modify_date: number;
	    configid: string;
	    type: string;
	    proxy: string;
	    notes: string;
	    useragent: string;
	    browser: string;
	    os: string;
	    screen: string;
	    language: string;
	    cpu: number;
	    memory: number;
	
	    static createFrom(source: any = {}) {
	        return new Profile(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.status = source["status"];
	        this.debug_port = source["debug_port"];
	        this.websocket_link = source["websocket_link"];
	        this.folder = source["folder"];
	        this.tags = source["tags"];
	        this.cloud_id = source["cloud_id"];
	        this.creation_date = source["creation_date"];
	        this.modify_date = source["modify_date"];
	        this.configid = source["configid"];
	        this.type = source["type"];
	        this.proxy = source["proxy"];
	        this.notes = source["notes"];
	        this.useragent = source["useragent"];
	        this.browser = source["browser"];
	        this.os = source["os"];
	        this.screen = source["screen"];
	        this.language = source["language"];
	        this.cpu = source["cpu"];
	        this.memory = source["memory"];
	    }
	}
	export class ProfileInfoResponse {
	    code: number;
	    status: string;
	    data: Profile;
	
	    static createFrom(source: any = {}) {
	        return new ProfileInfoResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.code = source["code"];
	        this.status = source["status"];
	        this.data = this.convertValues(source["data"], Profile);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ProfileResponse {
	    code: number;
	    status: string;
	    data: {[key: string]: Profile};
	
	    static createFrom(source: any = {}) {
	        return new ProfileResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.code = source["code"];
	        this.status = source["status"];
	        this.data = this.convertValues(source["data"], Profile, true);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

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

