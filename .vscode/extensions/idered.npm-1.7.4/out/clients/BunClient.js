"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _BunClient_uri, _BunClient_cwd;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BunClient = void 0;
const fs = require("fs");
const spawn = require("cross-spawn");
const path_1 = require("path");
const Client_1 = require("./Client");
const foundation_1 = require("foundation");
let BunClient = class BunClient extends Client_1.Client {
    constructor() {
        super(...arguments);
        _BunClient_uri.set(this, void 0);
        _BunClient_cwd.set(this, void 0);
    }
    cwdFromUri(uri) {
        __classPrivateFieldSet(this, _BunClient_uri, uri, "f");
        __classPrivateFieldSet(this, _BunClient_cwd, (0, path_1.dirname)(uri.fsPath), "f");
        return this;
    }
    audit() {
        return null;
        // const { stdout } = spawn.sync("yarn", ["audit", "--json"], {
        //   cwd: this.#cwd,
        // });
        // try {
        //   const [summary, ...items] = jsonl
        //     .parse(stdout.toString())
        //     .reverse() as any;
        //   const advisories = items.reduce(
        //     (all, { data: { advisory } }) => ({
        //       ...all,
        //       [advisory.id]: advisory,
        //     }),
        //     {}
        //   );
        //   const output = {
        //     advisories,
        //     muted: [],
        //     actions: items.map(({ data: { resolution } }) => ({
        //       module: advisories[resolution.id].module_name,
        //       resolves: resolution,
        //     })),
        //     metadata: summary.data,
        //   };
        //   return output;
        // } catch (err) {
        //   return null;
        // }
    }
    getAllPackages() {
        const contents = fs.readFileSync(__classPrivateFieldGet(this, _BunClient_uri, "f").fsPath, "utf8");
        const json = JSON.parse(contents);
        const allDependencies = Object.assign(Object.assign({}, (json.dependencies || {})), (json.devDependencies || {}));
        const devDependencies = Object.keys(json.devDependencies || {});
        return Object.entries(allDependencies).reduce((all, [name, version]) => {
            const isDevDependency = devDependencies.includes(name);
            return all.concat({ name, version, isDevDependency });
        }, []);
    }
    install({ isDev, query }) {
        const args = ["add", ...query.split(" ")];
        if (isDev) {
            args.push("-d");
        }
        spawn.sync("bun", args, {
            stdio: "inherit",
            cwd: __classPrivateFieldGet(this, _BunClient_cwd, "f"),
            windowsHide: true,
            shell: false,
        });
    }
    update({ query }) {
        const args = ["add", ...query.split(" ")];
        console.log(args);
        spawn.sync("bun", args, {
            stdio: "inherit",
            cwd: __classPrivateFieldGet(this, _BunClient_cwd, "f"),
            windowsHide: true,
            shell: false,
        });
    }
    remove({ packages }) {
        spawn.sync("bun", ["remove", ...packages], {
            stdio: "inherit",
            cwd: __classPrivateFieldGet(this, _BunClient_cwd, "f"),
            windowsHide: true,
            shell: false,
        });
    }
    swapType(args) {
        spawn.sync("bun", ["remove", args.packageName], {
            stdio: "inherit",
            cwd: __classPrivateFieldGet(this, _BunClient_cwd, "f"),
            windowsHide: true,
            shell: false,
        });
        spawn.sync("bun", [
            "add",
            `${args.packageName}@${args.version}`,
            args.isDev ? "" : "-d",
        ].filter(Boolean), {
            stdio: "inherit",
            cwd: __classPrivateFieldGet(this, _BunClient_cwd, "f"),
            windowsHide: true,
            shell: false,
        });
    }
};
_BunClient_uri = new WeakMap(), _BunClient_cwd = new WeakMap();
BunClient = __decorate([
    (0, foundation_1.injectable)()
], BunClient);
exports.BunClient = BunClient;
//# sourceMappingURL=BunClient.js.map