export default class BlobStream extends EventTarget {
		__closed: boolean;
		__corks: number;
		__destroyed: boolean;
        __parts: any[];

		constructor() {
			super();
			this.__closed = false;
			this.__corks = 0;
			this.__destroyed = false;
            this.__parts = [];
		}

		/** Why must node be like this */
		on(event: string, callback: EventListener) {
			if (!event || !callback) {
				throw new Error("Invalid handler");
			}
			this.addEventListener(event, callback);
		}

		addListener(event: string, callback: EventListener) {
			this.addEventListener(event, callback);
		}

		removeListener(event: string, callback: EventListener) {
			this.removeEventListener(event, callback);
		}

		once(event: string, callback: EventListener) {
			if (!event || !callback) {
				throw new Error("Invalid handler");
			}
			this.addEventListener(event, callback);
		}

		emit(_event: string, _otherThingIDontCareAbout: any) {
			return false;
		}

		destroy(error?: Error) {
			// this.__parts = [];
			this.__destroyed = true;
            console.log("Destoryed");
			if (error) {
				this.dispatchEvent(new ErrorEvent("error", { error: error }));
			}
			return this;
		}

		end(
			chunk?: string | Buffer | DataView | any,
			_encoding: string = "utf-8",
			callback?: Function,
		) {
			if (chunk) {
				this.write(chunk, _encoding);
			}
			this.dispatchEvent(new Event("finish"));
			if (callback && typeof callback === "function") {
				callback();
			}
			// console.log(`Ended stream, size: ${__parts.length}`, __parts);
			this.__closed = true;
			return this;
		}

		write(
			chunk: string | Buffer | DataView | any,
			_encoding: string = "utf-8",
			callback?: Function,
		) {
			if (this.__closed || this.__destroyed) {
				throw new Error();
			}
			if (chunk) {
				this.__parts.push(chunk);
				// console.log(`Wrote ${chunk}, new parts length: ${__parts.length}`);
			} else {
				console.log("Attempted to write nothing");
			}

			if (callback && typeof callback === "function") {
				callback();
			}
			return true;
		}

		cork() {
			this.__corks++;
		}

		uncork() {
			this.__corks--;
		}

		setDefaultEncoding(_encoding: string) {
			return this;
		}

		get writable() {
			return !this.__closed;
		}

		get writableAborted() {
			return false;
		}

		get writableEnded() {
			return this.__closed;
		}

		get writableCorked() {
			return this.__corks;
		}

		get closed() {
			return this.__closed;
		}

		get destroyed() {
			return this.__destroyed;
		}

		get errored() {
			return false;
		}

		get writableFinished() {
			return this.__closed;
		}

		get writableHighWaterMark() {
			return 0;
		}

		get writableLength() {
			return 0;
		}

		get writableNeedDrain() {
			return false;
		}

		get writableObjectMode() {
			return false;
		}

        parts() {
            return this.__parts;
        }

		blob() {
			return new Blob(this.__parts);
		}

		typedBlob(mimeType: string) {
			return new Blob(this.__parts, { type: mimeType });
		}

		file(name: string, mimeType: string) {
			return new File(this.__parts, name, { type: mimeType });
		}
	}

