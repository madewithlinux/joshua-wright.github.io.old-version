/**
 * Created by j0sh on 5/7/16.
 */
'use strict';

function Edge(src, dest, prop) {
    /*src and dest must be ids*/
    this.property = prop;
    this.src = src;
    this.dest = dest;
    this.opposite = function (v) {
        if (v === src) {
            return dest;
        } else {
            return src;
        }
    }
}

function Vertex(prop, id) {
    this.edges = [];
    this.property = prop;
    this.id = id;
}

function Graph() {
    this.last_vertex_id = 0;
    this.edges = new Map();
    /*maps [src,dest] arrays to edges*/
    this.vertexes = new Map();
    /*maps id's to vertexes*/
    this.add_vertex = function (prop) {
        /*TODO: is this the right way to do class methods?*/
        this.last_vertex_id++;
        var v = new Vertex(prop, this.last_vertex_id);
        this.vertexes.set(this.last_vertex_id, v);
        return v;
    };
    this.add_edge = function (src, dest, prop) {
        /*src and dest may be id's or vertexes*/
        if (src.prototype != Vertex) {
            /*TODO: better type matching*/
            src = this.vertexes.get(src);
        }
        if (dest.prototype != Vertex) {
            dest = this.vertexes.get(dest);
        }
        var e = new Edge(src, dest, prop);
        this.edges.set([src, dest], e);
        src.edges.push(e);
        dest.edges.push(e);
        return e;
    };
    this.add_edge_undirected = function (src, dest, prop) {
        this.add_edge(src, dest, prop);
        this.add_edge(dest, src, prop);
    }
}

function random_planar_graph(w, h) {
    var id_map = new Map();
    var out = new Graph();
    for (var x = 0; x < w; x++) {
        for (var y = 0; y < h; y++) {
            /*add vertex*/
            var v = out.add_vertex([x, y].toString());
            id_map.set([x, y].toString(), v);
            /*add edges*/
            if (x > 0) {
                var left_vertex = id_map.get([x - 1, y].toString());
                out.add_edge_undirected(left_vertex.id, v.id, Math.random());
            }
            if (y > 0) {
                var above_vertex = id_map.get([x, y - 1].toString());
                out.add_edge_undirected(above_vertex.id, v.id, Math.random());
            }
        }
    }
    return out;
}

function prim_jarnik_mst(graph) {
    var out = new Graph();
    var D = new Map();
    var ParentMap = new Map();
    graph.vertexes.forEach(function (v, k) {
        D.set(v.id, Math.Inf);
        D.set(v.id, 9999);
        /*make sure the vertex gets the right id*/
        /*TODO: this is kind of an ugly hack*/
        out.last_vertex_id = v.id - 1;
        out.add_vertex(v.property);
    });
    D.set(0, 0);
    /*starting node*/
    /*TODO: better priority queue*/
    var vertexes = Array.from(graph.vertexes.values());
    vertexes.sort(function (a, b) {return D.get(a) < D.get(b);});
    while (vertexes.length > 0) {
        var v = vertexes[0];
        vertexes.splice(0, 1);

        for (var i = 0; i < v.edges.length; i++) {
            var z = v.edges[i].opposite(v);
            console.log(v, z, v.edges[i]);
            if (v.edges[i].property < D.get(z.id)) {
                /*update distance*/
                D.set(v.id, v.edges[i].property);
                ParentMap.set(z, v);
                /*update key*/
                vertexes.sort(function (a, b) {return D.get(a) < D.get(b);});
            }
        }
    }
    console.log(D);
    console.log(ParentMap);
    ParentMap.forEach(function (v, k) {
        if (v != undefined && k != undefined) {/*root node has no parent*/
            out.add_edge_undirected(v.id, k.id, 1);
        }
    });
    return out;
}