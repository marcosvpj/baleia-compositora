module app;

import std.stdio;
import std.file;
import std.algorithm;
import std.array;
import std.json;
import std.typecons;
import std.conv;
import core.thread;
import requests;

auto desired(in string nameseed, in DirEntry f) pure {
    auto fname = f.name.split("/").reverse[0];
    return fname.endsWith(".json") && fname.startsWith(nameseed);
}

auto parser(in string f) {
    return tuple(f.split("/").reverse[0].split(".")[0], f.readText.parseJSON);
}

auto updater(in string chave, in string nome, JSONValue j) {
    j[chave] = j[chave].integer + 1;
    return tuple(nome, j.toJSON);
}

void send(in string endpoint, in string nome, in string payload) {
    Request rq = Request();
    rq.addHeaders(["Content-Type": "application/json"]);
    rq.put(endpoint ~ "/" ~ nome, payload).writeln;
}

void main(in string[] args) {
    while (true) { try {
        auto datum = dirEntries(args[2], SpanMode.shallow)
            .filter!(x => desired(args[3], x))
            .map!parser
            .filter!(x => (args[4] in x[1]))
            .map!(x => updater(args[4], x.expand));

        foreach (payload; datum) {
            Thread.sleep(dur!"msecs"(200));
            send(args[1], payload.expand);
        }
    } catch(Exception) {} }
}
