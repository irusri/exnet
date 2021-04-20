var exNet = null;
var cxtmenuApi = null;
var qtipmenuApi = null;
var fingerprint = getCookie('fingerprint');
var optimized = false;
var private_default_gene_ids;
var private_select_table = "";
var selected_threshold = 0;
var private_network_table = "";
var slider_min = 0;
var slider_max = 0;
var removed;
var removedSelected;
var layout_type = "cose-bilkent";
var t_zoom = false;
var popup_flag = false;
toastr.options = {
    "closeButton": false,
    "debug": false,
    "positionClass": "toast-bottom-right",
    "onclick": null,
    "showDuration": "20000",
    "hideDuration": "4000",
    "timeOut": "20000",
    "extendedTimeOut": "10000",
    "showEasing": "linear",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut",
    "preventDuplicates": true
}
$('#select_layout_table').on('change', function() {
    setCookie('network_layout', this.value);
    if (exNet != null) {
        layout_type = this.value;
        runSelectedLayout();
    }
});
var update_firsttime = true;
//Change the table dropdown 
$('#select_table').change(function(e) {
    update_firsttime = true;
    var t = getCookie('cookie_view');
    if (t != this.value) {
        $('.loader-wrap').show();
        private_select_table = this.value;
        setCookie('cookie_view', this.value);
        getMinmax(function(activeexpriments) {
            slider_min = parseFloat(activeexpriments["minimum"]);
            slider_max = parseFloat(activeexpriments["maximum"]);
            appendSlider();
            LoadNetwork(fingerprint, private_select_table, $('#threshold_slider').val());
        });
    }
})
//Initialize tools
function reinitTool(newArray) {
    $("#exnet_save").hide();
    maingetAllNetworks(function(activeexpriments) {
        if (activeexpriments.length == 0) {
            alert("No networks are available for this species. please select an another species.");
            window.location.href = "#";
        }
        var tmp_selected = "";
        var tmp_arr = [];
        $("#select_table").html("");
        for (var i = 0; i < activeexpriments.length; i++) {
            var tmp_name = activeexpriments[i]["experiment_name"].trim();
            if (tmp_name == "P. abies exatlas") {
                continue;
            }
            var tmp_value = activeexpriments[i]["experiment_value"].trim();
            if (activeexpriments[i]["visibility"].trim() == "false") {
                continue;
            }
            $("#select_table").append($("<option value='" + tmp_value + "'>" + tmp_name + "</option>"))
            if (activeexpriments[i]["default selection"] == "1") {
                tmp_selected = tmp_value;
            }
            tmp_arr.push(tmp_value);
        }
        var cookieView = getCookie('cookie_view')
        if (cookieView == null || jQuery.inArray(cookieView, tmp_arr) == -1) {
            var tmp_firstValue = $('#select_table > option:first').val();
            $('#select_table').val(tmp_firstValue)
            private_select_table = tmp_firstValue;
            setCookie('cookie_view', tmp_firstValue);
        } else {
            private_select_table = cookieView;
            $('#select_table').val(cookieView).change();
        }
        var network_layout = getCookie('network_layout');
        if (network_layout == null) {
            var tmp_network_layout = $('#select_layout_table > option:first').val();
            $('#select_layout_table').val(tmp_network_layout)
            setCookie('network_layout', tmp_network_layout);
        } else {
            layout_type = network_layout;
            $('#select_layout_table').val(network_layout).change();
        }
        if (newArray[0] != undefined && newArray[0].length > 0) {
            private_default_gene_ids = newArray[0].join(",");
            if (newArray[0].length > 2000) {
                toastr.warning('More edges will slow down the speed.', 'Too many edges');
            }
        }
        if (newArray[0] == undefined || newArray[0] == "") {
            var r = confirm("This tool will not work until you create a gene list containing some genes, Do you want to create an example genelist?");
            if (r == true) {
                createexampleGenelist();
                toastr.success('An example genelist has been created', 'Success!');
            } else {
                toastr.warning('Please create an active genelist.', 'No active genelist!');
            }
        }
        getMinmax(function(activeexpriments) {
            slider_min = parseFloat(activeexpriments["minimum"]);
            slider_max = parseFloat(activeexpriments["maximum"]);
            appendSlider();
            LoadNetwork(fingerprint, private_select_table, $('#threshold_slider').val());
        });
    });
}

function format_slider(slider_value) {
    var slider_v = Math.log10(pnormN(slider_value)).toFixed(0)
    //console.log(slider_v)
    return slider_v;
}
var lastSliderValue;
//End Initialize tools
//Append slider for changing therehsolds
function appendSlider() {
    var selected_threshold_cookie = getCookie('selected_threshold');
    //console.log("Saved-"+(selected_threshold_cookie))
    if (selected_threshold_cookie != null) {
        selected_threshold_cookie = parseInt(selected_threshold_cookie);
        selected_threshold = selected_threshold_cookie;
    } else {
        selected_threshold = Math.log10(pnormN((slider_min + slider_max))) / 2;
    }
    //console.log("min"+parseFloat(Math.log10(pnormN(slider_max))))
    //console.log("max"+parseFloat(Math.log10(pnormN(slider_min))))
    if (slider_max < 2) {
        step_value = 1;
    } else {
        step_value = 1
    }
    $("#threshold_slider").innerHTML = "";
    $("#threshold_slider").slider({
        range: "min",
        step: step_value,
        animate: "fast",
        value: selected_threshold,
        min: parseInt(Math.log10(pnormN(slider_max))),
        max: -1, //parseFloat(Math.log10(pnormN(slider_min))),
        //change: function( event, ui ) {console.log(ui.value)}
    });
    //console.log("A"+selected_threshold)
    $("#th2_span").html(" <font color='#e15b63'>10<sup>" + (selected_threshold * 100 / 100).toFixed(0) + "</sup></font>");
    $(".min-range").html("min 10<sup>" + format_slider(slider_max) + "</sup>");
    $(".max-range").html("max 10<sup>" + format_slider(slider_min) + "</sup>");
    $("#threshold_slider").on("slidestop", function(event, ui) {
        /*if(update_firsttime==true){
        	update_firsttime=false;
        	return true;
        	
        }*/
        selected_threshold = parseInt($("#threshold_slider").slider("value"));
        if (lastSliderValue == selected_threshold) {
            return true;
        }
        //console.log("B"+selected_threshold)
        lastSliderValue = selected_threshold;
        //console.log("Changed-"+selected_threshold,($("#threshold_slider").slider("value")))
        //$("#th2_span").html("(< 10 ^" + (Math.log10(pnormNN(selected_threshold))*100/100).toFixed(2) + ")");
        $("#th2_span").html(" <font color='#e15b63'>10<sup>" + (selected_threshold * 100 / 100).toFixed(0) + "</sup></font>"); //	$("#ratio_span").html(selected_threshold);
        //$("#ratio_span").html("min 10<sup>"+format_slider(slider_max)+"</sup><br>max 10<sup>"+format_slider(slider_min)+"</sup>)");
        $(".min-range").html("min 10<sup>" + format_slider(slider_max) + "</sup>");
        $(".max-range").html("max 10<sup>" + format_slider(slider_min) + "</sup>");
        setCookie('selected_threshold', selected_threshold);
        if (exNet == null) {
            var nodes = [];
        } else {
            var nodes = exNet.$('node:selected');
        }
        if (nodes.length > 0) {
            exnet_expand();
        } else {
            LoadNetwork(fingerprint, private_select_table, $('#threshold_slider').val());
        }
    });
    var sliderValue = 5;
    $("#max_connections_slider").on("changeslider", function(e, t) {
        $("#get_edges_span").html("(<= " + t.value + ")");
    });
}
//Get min and max - This is an obsolete function
function getMinmax(all_genelist_func) {
    var finalvar = "network=" + private_select_table + "&name=" + MAIN_GENELIST_TABLE + "&table=network";
    $.ajax({
        url: "https://api.plantgenie.org/network/range",
        type: "POST",
        dataType: "json",
        data: (finalvar),
        success: all_genelist_func,
        error: function(request, error) {
            //console.log(request, error);
            $('.loader-wrap').hide();
            $("#loader_exnet").hide();
            toastr.options = {
                "closeButton": false,
                "debug": false,
                "positionClass": "toast-bottom-right",
                "onclick": null,
                "showDuration": "4000",
                "hideDuration": "1000",
                "timeOut": "4000",
                "extendedTimeOut": "0",
                "showEasing": "linear",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut",
                "preventDuplicates": true
            }
            toastr.error('Please select gene ids or network in not available for selected species', 'No genes selected');
        }
    });
}
//Create new  genelist by button
$("#create_new").click(function() {
    create_new_gene_list();
});
//Create new  genelist by button or right click
function create_new_gene_list() {
    var nodes = exNet.$('node:selected');
    if (nodes.length == 0) {
        toastr.error('Please select a few nodes to create genelist', 'No genes selected');
        return true;
    }
    var genes = [];
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        genes.push(node.data("name"));
    }
    exNet.elements().unselect();
    var list_name = "exnet_" + Math.floor(Math.random() * 1000);
    mainCreategenelistbyName(genes.join(","), list_name, function(e) {
        $("#exNet").stop();
        $("#exNet").effect("transfer", {
            to: "#geniemenu-controller-0",
            className: "ui-effects-transfer-2"
        }, 600);
        get_active(function(e) {
            updategenebasket();
            location.reload();
        })
    })
}
//Network functions
$("#nameinput").on('change keyup paste', function() {
    if ($('#nameinput').val().length > 0) {
        $('#exnet_save').show();
    } else {
        $('#exnet_save').hide();
    }
});
$("#custom").spectrum({
    showPaletteOnly: true,
    togglePaletteOnly: true,
    togglePaletteMoreText: 'more',
    togglePaletteLessText: 'less',
    color: 'blanchedalmond',
    palette: [
        ["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"],
        ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"],
        ["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"],
        ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"],
        ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"],
        ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"],
        ["#900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"],
        ["#600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]
    ],
    move: function(color) {
        colorgenes(color.toHexString())
    }
});
// Change colour of the node - Obsolete function
var main_color_array = [];

function colorgenes(color = false) {
    if (!color) {
        color = $("#selected_col_button").val();
    }
    exNet.startBatch();
    var nodes = exNet.$('node:selected');
    if (nodes.length == 0) {
        toastr.error('Please select a few nodes to color', 'No genes selected');
        return true;
    }
    var obj = {};
    var tmp_color = [];
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        node.data({
            clr: color
        });
        tmp_color.push(nodes[i]._private.data.id);
    }
    obj[color] = tmp_color;
    main_color_array.push(obj);
    exNet.endBatch();
}

function removegenes(color = false) {
    exNet.startBatch();
    var nodes = exNet.$('node:selected');
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        exNet.remove(nodes);
    }
    exNet.endBatch();
}

function coloredges() {
    var color = $("#selected_col_button").val();
    exNet.startBatch();
    var edges = exNet.$('edge:selected');
    for (var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        edge.data({
            clr: color,
            'z-index': 999
        });
    }
    exNet.endBatch();
}
var tmp_gene_exanded = "";
var toggleLabel = true;
// Show hide labels
function hide_label() {
    if (toggleLabel == false) {
        toggleLabel = true;
        $("#show_hide_label").html("Hide Labels")
    } else {
        toggleLabel = false;
        $("#show_hide_label").html("Show Labels")
    }
    exNet.startBatch();
    var all_genes = [];
    var nodes = exNet.nodes();
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        node.style({
            'label': toggleLabel ? (node._private.data.name) : '.',
            'font-size': toggleLabel ? 6 : 0
        });
    }
    exNet.endBatch();
    /*exNet.style().selector('node')
      .style({ 'label': toggleLabel?'':name })
      .update();
	console.log(exNet.nodes()._private.data.name)*/
}
/*Change exNet newtork type
 */
function CreateNetwork(network) {
    exNet = window.exNet = cytoscape({
        container: document.getElementById('exNet'), // container to render in
        style: cytoscape.stylesheet().selector('node').css({
            'background-color': 'data(clr)',
            'border-width': 'data(bw)',
            'border-style': 'solid',
            'border-color': 'data(b)',
            'label': toggleLabel ? 'data(name)' : '',
            'shape': 'data(shape)',
            'width': '15',
            'height': '15',
            'font-size': 6,
        }).selector('edge').css({
            'width': 'mapData(width, 5, 9, 1, 5)',
            'line-color': 'data(clr)',
            'opacity': 0.7,
            'min-zoomed-font-size': 1,
            'curve-style': 'haystack',
        }).selector(':selected').css({
            'border-width': '1.5px',
            'border-style': 'solid',
            'border-color': '#FFD700',
            'line-color': '#CD3700',
        }).selector('core').css({
            "selection-box-color": "#ddd",
            "selection-box-opacity": 0.65,
            "selection-box-border-color": "#aaa",
            "selection-box-border-width": 1,
            "panning-cursor": "grabbing",
            "active-bg-color": "black",
            "active-bg-opacity": 0.15,
            "active-bg-size": 15
        }).selector('node[label]').css({
            "opacity": 0,
            "text-rotation": "autorotate",
            "text-margin-x": "0px",
            "text-margin-y": "0px"
        }),
        elements: network,
        boxSelectionEnabled: true,
        hideEdgesOnViewport: true,
        hideLabelsOnViewport: true,
        userPanningEnabled: t_zoom, //chanaka
        panningEnabled: true,
        minZoom: 0.1,
        maxZoom: 5,
        selectionType: 'single',
        renderer: {
            name: 'canvas',
            showFps: false // show debugging approx. fps
        },
        pixelRatio: 1, // default:'auto', normalise pixel ratio to 1 here so different screens don't alter performance
        hideEdgesOnViewport: false,
    });
    exNet.panzoom({
        // options here...
    });
    return exNet;
}

function toggle_pan_zoom() {
    if (t_zoom == false) {
        exNet.userPanningEnabled(true);
        t_zoom = true;
        $("#t_p_z").css("background-color", "#9EBF6D");
        $("#t_p_z").css("color", "#ffffff");
        $("#t_p_z").html("Zoom Enabled")
    } else {
        exNet.userPanningEnabled(false);
        t_zoom = false;
        $("#t_p_z").css("background-color", "inherit");
        $("#t_p_z").css("color", "#000000");
        $("#t_p_z").html("Zoom Disabled")
    }
}

function select_color(color) {
    $("#selected_col_button").css("background-color", color);
    $("#selected_col_button").val(color);
}

function set_node_mouseclick_event() {
    exNet.on('unselect', 'node', function(event) {
        showhide();
    });
    exNet.on('select', 'node', function(event) {
        showhide();
    });
}
/*show/hide network action buttons depending on the situation*/
function showhide() {
    var nodes = exNet.$('node:selected');
    var connectedEdges = exNet.$('node:selected').connectedEdges();
    if (nodes.length == 0) {
        $("#invertbutton").hide();
        $("#neighboursbutton").hide();
        $("#expandbutton").hide();
        $("#create_new").hide();
    } else {
        $("#invertbutton").show();
        (connectedEdges.length == 0) ? $("#neighboursbutton").hide(): $("#neighboursbutton").show();
        $("#expandbutton").show();
        $("#create_new").show();
    }
}
var mouseove_gene = "";
/* Other functions related to the network display*/
function set_node_mouseover_event() {
    exNet.on('mouseover', 'node', function(event) {
        var tmp_id = event.target[0]._private.data.id;
        if (mouseove_gene != tmp_id && popup_flag == true) {
            var finalvar = "id=" + tmp_id + "&name=" + MAIN_GENELIST_TABLE;
            $.ajax({
                url: "https://api.plantgenie.org/network/additional_info",
                type: "POST",
                dataType: 'json',
                data: (finalvar),
            }).then(function(data) {
                $("#add_info").show();
                var go_desc = data[0].go_description;
                var go_str = "";
                if (go_desc != null) {
                    var tmpgoArray = go_desc.split(";");
                    tmpgoArray = arr_unique(tmpgoArray);
                    $.each(tmpgoArray, function(key, value) {
                        var endstr;
                        (key % 2 != 0) ? (endstr = "<br>") : ((key == tmpgoArray.length - 1) ? endstr = "" : endstr = "<br>")
                        go_str += ("<a onmouseover='get_ontology(this)'   style='color:#80B1D3' target='_blank' href='http://amigo.geneontology.org/amigo/term/" + value.substr(0, value.indexOf('-')) + "'>" + value.substr(0, value.indexOf('-')) + "</a>-" + value.substr(value.indexOf('-') + 1) + "" + endstr);
                    });
                } else {
                    go_str = "NA";
                }
                var pfam_desc = data[0].pfam_description;
                var pfam_str = "";
                if (pfam_desc != null) {
                    var tmppfamArray = pfam_desc.split(";");
                    tmppfamArray = arr_unique(tmppfamArray);
                    $.each(tmppfamArray, function(key, value) {
                        var endstr;
                        (key % 2 != 0) ? (endstr = "<br>") : ((key == tmppfamArray.length - 1) ? endstr = "" : endstr = "<br>")
                        pfam_str += ("<a  style='color:#80B1D3' target='_blank' href='//plantgenie.org/redirect.php?id=" + value.substr(0, value.indexOf('-')) + "'>" + value.substr(0, value.indexOf('-')) + "</a>-" + value.substr(value.indexOf('-') + 1) + "" + endstr);
                    });
                } else {
                    pfam_str = "NA";
                }
                var temp_tf = data[0].tf;
                var tf_str = "";
                if (temp_tf != null) {
                    tf_str = "<br><strong>Transcription factor</strong><br><a  style='color:#80B1D3' target='_blank' href='https://plantgrn.noble.org/PlantTFcat/showfamily.do?family_acc=" + temp_tf.split('--')[0] + "'>" + temp_tf.split("--")[0] + "</a> - " + temp_tf.split('--')[1];
                } else {}
                $("#add_info_span").html("<br><strong>Gene Informtion</strong><br><br><u><a target='_blank' style='color:#80B1D3' href='https://beta.plantgenie.org/gene?id=" + data[0].id + "'>" + data[0].id + "</a></u><br>" + data[0].description + "<br><br><strong>Gene Ontology<span style='cursor:pointer' onmouseover='out_ontology()'>[Reset color]</span></strong><br>" + go_str + "<br><br><strong>Pfam</strong><br>" + pfam_str + "<br>" + tf_str + "<br><br><br>");
            }, function(xhr, status, error) {
                console.log(error)
            });
            mouseove_gene = tmp_id;
        }
    });
}

function hide_info() {
    $("#add_info").hide();
}

function hide_info_forever() {
    $("#add_info").hide();
    popup_flag = false;
    $("#info_window_chkbox").prop("checked", false);
}

function toggle_check(checked) {
    if (checked.checked == false) {
        $("#add_info").hide();
        popup_flag = false;
    } else {
        popup_flag = true;
        $("#add_info").show();
    }
}

function get_ontology(id) {
    out_ontology();
    var coloured_genes = [];
    var finalvar = "table=" + private_select_table + "&id=" + id.innerHTML;
    $.ajax({
        url: "plugins/exnet/getontology.php",
        type: "POST",
        dataType: "json",
        data: (finalvar),
        success: function(data, status) {
            exNet.startBatch();
            var nodes = exNet.nodes();
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                var id = node.data("id");
                if (data.includes(id)) {
                    coloured_genes.push(id)
                    node.data({
                        clr: "#FB8072"
                    });
                } else {
                    node.data({
                        clr: "#6C9270"
                    });
                }
            }
            exNet.endBatch();
            setCookie("col_genes", JSON.stringify(coloured_genes))
        },
        error: function(request, error) {
            console.log(request, error);
        }
    });
}

function in_ontology() {
    var saved_color_array = [];
    saved_color_array = JSON.parse(getCookie("col_genes"));
    if (saved_color_array == null) {
        return true;
    }
    exNet.startBatch();
    var nodes = exNet.nodes();
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (saved_color_array.indexOf(node._private.data.id) > -1) {
            node.data({
                clr: "#FB8072"
            });
        } else {
            node.data({
                clr: "#6C9270"
            });
        }
    }
    exNet.endBatch();
}

function out_ontology() {
    setCookie("col_genes", JSON.stringify([]))
    exNet.startBatch();
    var nodes = exNet.nodes();
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        node.data({
            clr: "#6C9270"
        });
    }
    exNet.endBatch();
}

function show_tf_genes() {
    exNet.startBatch();
    var all_genes = [];
    var nodes = exNet.nodes();
    for (var i = 0; i < nodes.length; i++) {
        all_genes.push(nodes[i]._private.data.id);
    }
    exNet.endBatch();
    var finalvar = "table=" + private_select_table + "&private_default_gene_ids=" + all_genes.join(",") + "&name=" + MAIN_GENELIST_TABLE;
    $.ajax({
        url: "https://api.plantgenie.org/network/tf",
        type: "POST",
        dataType: "json",
        data: (finalvar),
        success: function(data, status) {
            if (data != undefined) {
                exNet.startBatch();
                var tmp_nodes = exNet.nodes();
                for (var j = 0; j < tmp_nodes.length; j++) {
                    var t_node = nodes[j];
                    if (t_node == undefined) {
                        continue
                    }
                    var t_id = t_node.data("id");
                    if (data.includes(t_id)) {
                        t_node.data({
                            shape: "triangle"
                        });
                    }
                }
                exNet.endBatch();
            }
        },
        error: function(request, error) {
            console.log(request, error);
        }
    });
}

function set_edge_mouseover_event() {}

function ajax_call() {
    $.ajax({
        type: 'json',
        url: "plugins/exnet/python/qtip.cgi",
        data: JSON.stringify({
            "gene": "26103"
        }),
        success: function(data, status) {
            for (var i = 0; i < data.length; i++) {
                console.log(data[i].title);
                console.log(data[i].text);
            }
        }
    });
}

function exnet_expand(ele) {
    var exp_genes = [];
    exNet.startBatch();
    var nodes = exNet.$('node:selected');
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        exp_genes.push(node.data("id"));
    }
    exNet.endBatch();
    if (exp_genes.length == 0) {
        toastr.clear();
        toastr.error('Please select a few nodes in the network.', 'No genes selected');
        return false;
    }
    var network = LoadNetwork(fingerprint, private_select_table, $('#threshold_slider').val(), selected_threshold, exp_genes.join(","));
    return network;
}

function invert_selection() {
    var selected = exNet.$('node:selected');
    var unselected = exNet.$('node:unselected');
    unselected.select();
    selected.unselect();
}

function grow_selected() {
    var neighbours = exNet.$('node:selected').neighbourhood();
    neighbours.select();
}
//removegenes();
function update(operation) {
    var name = false;
    var trash = false
    exNet.startBatch();
    ////  Color genes based on selection
    if (operation == "replace") {
        invert_selection();
        colorgenes('#FAFAFA');
        invert_selection();
        colorgenes($("#default_col").val());
    } else if (operation == "remove") {
        colorgenes('#FAFAFA');
    } else if (operation == "add") {
        colorgenes($("#default_col").val());
    } else if (operation == "trash") {
        trash = true;
        operation = "remove";
    } else {}
    ////  If new list, change function to replace but add a valid name
    if (operation == "new") {
        operation = "replace";
        name = $('#nameinput').val();
    }
    ////  Do actual select
    var nodes = exNet.$('node:selected');
    var genes = [];
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        genes.push(node.data("name"));
    }
    update_genes(genes, name = name, operation = operation);
    if (trash) {
        exNet.remove(exNet.$('node:selected'));
    }
    exNet.endBatch();
    update_network_info();
}

function update_network_info(max = false) {
    var string = "Nodes: " + exNet.nodes().length + " Edges: " + exNet.edges().length;
    if (max) {
        $("#network_info_text2").html("CLR range: " + $('#input_visual').val() + " - " + Math.round(max * 100) / 100 + "");
    }
    //console.log("done")
    $("#network_info_text").html(string);
}

function reload2() {
    var exp_genes = [];
    var nodes = exNet.nodes();
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var tmp_str = node.data("id") + ":" + node.data("name")
        exp_genes.push(node.data("id"));
        // exp_genes.push(node.data("name"));
    }
    var network = LoadNetwork(fingerprint, private_select_table, $('#threshold_slider').val(), expand = selected_threshold, genes_expanded = exp_genes.join(","), reload = true);
    update_network_info();
}

function toggle_zoom() {
    if (exNet.userPanningEnabled()) {
        zoom = false;
    } else {
        zoom = true;
    }
    exNet.userPanningEnabled(zoom);
}
var removedEdges = [];

function update_visual_onchange() {
    if (removedEdges.length > 0) {
        removedEdges.restore();
    }
    var thresh = $('#input_visual').val();
    removedEdges = exNet.edges().filter('[cor < ' + thresh + ']');
    removedEdges.remove();
    document.getElementById("no_edges").innerHTML = exNet.edges().length;
    if (thresh < optimized) {
        toastr.clear();
        toastr.warning(' The current threshold setting will on reload result in a network with more than the recommended number of edges, the network may be slow and take several minutes to load', 'Warning!');
    }
}

function show_nexpanded() {
    var ethresh = selected_threshold;
    var snodes = [];
    exNet.startBatch();
    var nodes = exNet.$('node:selected');
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i].data("id");
        snodes.push(node);
    }
    exNet.endBatch();
    if (snodes.length > 0) {
        $.ajax({
            type: 'json',
            url: "plugins/exnet/python/exNet.cgi",
            data: JSON.stringify({
                "ngenes": "True",
                "genes_expand": snodes,
                "expand": ethresh,
                "table": private_select_table
            }),
            success: function(data, status) {
                //console.log("show_nexpanded:" + data)
                exnet_expand();
                $('#expand_message').html(data["ngenes"] + " new genes at threshold: " + ethresh);
            },
            error: function(data, status) {
                console.log("Error: ")
                console.log(data);
            }
        });
    } else {
        //toastr.error('Please select some nodes to expand', 'Select nodes!');
        exNet.nodes().select();
        exnet_expand();
        //alert("Please select some nodes to expand");
    }
}
var selectAllOfTheSameType = function(ele) {
    //  console.log(ele)
    exNet.elements().unselect();
    if (ele.isNode()) {
        exNet.nodes().select();
    } else if (ele.isEdge()) {
        exNet.edges().select();
    }
};
var unselectAllOfTheSameType = function(ele) {
    if (ele.isNode()) {
        exNet.nodes().unselect();
    } else if (ele.isEdge()) {
        exNet.edges().unselect();
    }
};

function add_gene_to_list(id) {
    var nodes = exNet.$('node:selected');
    if (nodes.length == 0) {
        toastr.error('Please select a few nodes to add to the genelist.', 'No genes selected');
        return true;
    }
    var genes = [];
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        genes.push(node.data("name"));
    }
    exNet.elements().unselect();
    mainAddgenestocurrentlist(genes.join(","), function(e) {
        $("#exNet").stop();
        $("#exNet").effect("transfer", {
            to: "#geniemenu-controller-0",
            className: "ui-effects-transfer-2"
        }, 600);
        location.reload();
    })
}

function initialize_context_menu() {
    var contextMenu = exNet.contextMenus({
        menuItems: [{
            id: 'remove',
            content: 'remove',
            selector: 'node, edge',
            show: false,
            onClickFunction: function(event) {
                var target = event.target || event.cyTarget;
                removed = target.remove();
                contextMenu.showMenuItem('undo-last-remove');
            },
            hasTrailingDivider: true
        }, {
            id: 'undo-last-remove',
            content: 'undo last remove',
            selector: 'node, edge',
            show: false,
            coreAsWell: true,
            onClickFunction: function(event) {
                if (removed) {
                    removed.restore();
                }
                contextMenu.hideMenuItem('undo-last-remove');
            },
            hasTrailingDivider: true
        }, {
            id: 'hide',
            content: 'hide',
            selector: '*',
            show: false,
            onClickFunction: function(event) {
                var target = event.target || event.cyTarget;
                target.hide();
            },
            disabled: false
        }, {
            id: 'expand-genes-nodes',
            content: 'expand genes',
            selector: 'node',
            show: true,
            onClickFunction: function(event) {
                exnet_expand();
            }
        }, {
            id: 'add-gene-to-list',
            content: 'add genes active list',
            selector: 'node',
            show: true,
            onClickFunction: function(event) {
                add_gene_to_list();
            }
        }, {
            id: 'create-new-list',
            content: 'create a new list',
            selector: 'node',
            show: true,
            onClickFunction: function(event) {
                create_new_gene_list();
            }
        }, {
            id: 'select-all-nodes',
            content: 'Select All',
            coreAsWell: false,
            onClickFunction: function(event) {
                exNet.nodes().select();
            }
        }, {
            id: 'goto-gene-pages',
            content: 'go to gene pages',
            coreAsWell: false,
            selector: 'node',
            onClickFunction: function(event) {
                console.log(event.target._private.data.name)
                //var tmp_node = event.cyTarget[0]._private.data.name || event.target[0]._private.data.name;
                window.open("/gene?id=" + event.target._private.data.name, "_blank")
                // exNet.nodes().select();
            }
        }, {
            id: 'goto-eximage',
            content: 'go to exImage',
            coreAsWell: false,
            selector: 'node',
            onClickFunction: function(event) {
                //var tmp_node = event.cyTarget[0]._private.data.name || event.target[0]._private.data.name;
                window.open("/eximage?id=" + event.target._private.data.name, "_blank")
                // exNet.nodes().select();
            }
        }, {
            id: 'remove-selected',
            content: 'remove selected',
            coreAsWell: true,
            show: false,
            onClickFunction: function(event) {
                removedSelected = exNet.$(':selected').remove();
                contextMenu.hideMenuItem('remove-selected');
                contextMenu.showMenuItem('restore-selected');
            }
        }, {
            id: 'restore-selected',
            content: 'restore selected',
            coreAsWell: true,
            show: false,
            onClickFunction: function(event) {
                if (removedSelected) {
                    removedSelected.restore();
                }
                contextMenu.showMenuItem('remove-selected');
                contextMenu.hideMenuItem('restore-selected');
            }
        }, {
            id: 'select-all-nodes',
            content: 'select all nodes',
            selector: 'node',
            show: true,
            onClickFunction: function(event) {
                selectAllOfTheSameType(event.target || event.cyTarget);
                contextMenu.hideMenuItem('select-all-nodes');
                contextMenu.showMenuItem('unselect-all-nodes');
            }
        }, {
            id: 'unselect-all-nodes',
            content: 'unselect all nodes',
            selector: 'node',
            show: false,
            onClickFunction: function(event) {
                unselectAllOfTheSameType(event.target || event.cyTarget);
                contextMenu.showMenuItem('select-all-nodes');
                contextMenu.hideMenuItem('unselect-all-nodes');
            }
        }, {
            id: 'select-all-edges',
            content: 'select all edges',
            selector: 'edge',
            show: true,
            onClickFunction: function(event) {
                selectAllOfTheSameType(event.target || event.cyTarget);
                contextMenu.hideMenuItem('select-all-edges');
                contextMenu.showMenuItem('unselect-all-edges');
            }
        }, {
            id: 'unselect-all-edges',
            content: 'unselect all edges',
            selector: 'edge',
            show: false,
            onClickFunction: function(event) {
                unselectAllOfTheSameType(event.target || event.cyTarget);
                contextMenu.showMenuItem('select-all-edges');
                contextMenu.hideMenuItem('unselect-all-edges');
            }
        }]
    });
}

function expand_me() {
    var exp_genes = [];
    exNet.startBatch();
    var nodes = exNet.$('node:selected');
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var tmp_str = node.data("id") + ":" + node.data("name")
        exp_genes.push(node.data("id"));
        // exp_genes.push(node.data("name"));
    }
    exNet.endBatch();
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "plugins/exnet/exnet_b.php",
        data: {
            "table": private_select_table,
            "fingerprint": "JA1301822998",
            "threshold": 5,
            "expand": true,
            "genes_expand": exp_genes.join(","),
            "reload": false,
            "name": MAIN_GENELIST_TABLE
        },
        success: function(data, status) {
            //	console.log(data)
        }
    });
}

function export_network() {
    var element = document.createElement('a');
    element.setAttribute('href', exNet.png().replace(/^data:image\/[^;]+/, 'data:application/octet-stream'));
    element.setAttribute('download', "exNet_export.png");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
}

function animateValue(id, start, end, duration) {
    // assumes integer values for start and end
    var obj = document.getElementById(id);
    //obj.innerHTML =0;
    var range = end - start;
    // no timer shorter than 50ms (not really visible any way)
    var minTimer = 50;
    // calc step time to show all interediate values
    var stepTime = Math.abs(Math.floor(duration / range));
    // never go below minTimer
    stepTime = Math.max(stepTime, minTimer);
    // get current time and calculate desired end time
    var startTime = new Date().getTime();
    var endTime = startTime + duration;
    var timer;

    function run() {
        var now = new Date().getTime();
        var remaining = Math.max((endTime - now) / duration, 0);
        var value = Math.round(end - (remaining * range));
        obj.innerHTML = value;
        if (value == end) {
            clearInterval(timer);
        }
    }
    var timer = setInterval(run, stepTime);
    run();
}
/* qt(0.999999999999999, Inf, lower.tail=FALSE)*/
var qnorm = function(p) {
    // ALGORITHM AS 111, APPL.STATIST., VOL.26, 118-121, 1977.
    // Computes z = invNorm(p)
    p = parseFloat(p);
    var split = 0.42;
    var a0 = 2.50662823884;
    var a1 = -18.61500062529;
    var a2 = 41.39119773534;
    var a3 = -25.44106049637;
    var b1 = -8.47351093090;
    var b2 = 23.08336743743;
    var b3 = -21.06224101826;
    var b4 = 3.13082909833;
    var c0 = -2.78718931138;
    var c1 = -2.29796479134;
    var c2 = 4.85014127135;
    var c3 = 2.32121276858;
    var d1 = 3.54388924762;
    var d2 = 1.63706781897;
    var q = p - 0.5;
    var r, ppnd;
    if (Math.abs(q) <= split) {
        r = q * q;
        ppnd = q * (((a3 * r + a2) * r + a1) * r + a0) / ((((b4 * r + b3) * r + b2) * r + b1) * r + 1);
    } else {
        r = p;
        if (q > 0) r = 1 - p;
        if (r > 0) {
            r = Math.sqrt(-Math.log(r));
            ppnd = (((c3 * r + c2) * r + c1) * r + c0) / ((d2 * r + d1) * r + 1);
            if (q < 0) ppnd = -ppnd;
        } else {
            ppnd = 0;
        }
    }
    return ppnd;
}

function pnorm(z) {
    // Algorithm AS66 Applied Statistics (1973) vol22 no.3
    // Computes P(Z<z)
    z = parseFloat(z);
    var upper = true;
    var ltone = 7.0;
    var utzero = 18.66;
    var con = 1.28;
    var a1 = 0.398942280444;
    var a2 = 0.399903438504;
    var a3 = 5.75885480458;
    var a4 = 29.8213557808;
    var a5 = 2.62433121679;
    var a6 = 48.6959930692;
    var a7 = 5.92885724438;
    var b1 = 0.398942280385;
    var b2 = 3.8052e-8;
    var b3 = 1.00000615302;
    var b4 = 3.98064794e-4;
    var b5 = 1.986153813664;
    var b6 = 0.151679116635;
    var b7 = 5.29330324926;
    var b8 = 4.8385912808;
    var b9 = 15.1508972451;
    var b10 = 0.742380924027;
    var b11 = 30.789933034;
    var b12 = 3.99019417011;
    if (z < 0) {
        upper = !upper;
        z = -z;
    }
    if (z <= ltone || upper && z <= utzero) {
        y = 0.5 * z * z;
        if (z > con) {
            var alnorm = b1 * Math.exp(-y) / (z - b2 + b3 / (z + b4 + b5 / (z - b6 + b7 / (z + b8 - b9 / (z + b10 + b11 / (z + b12))))));
        } else {
            alnorm = 0.5 - z * (a1 - a2 * y / (y + a3 - a4 / (y + a5 + a6 / (y + a7))));
        }
    } else {
        alnorm = 0;
    }
    if (!upper) alnorm = 1 - alnorm;
    return (alnorm);
}

function loadSelectedGraph() {
    var file = document.getElementById('network').value;
    //document.getElementById('layout').value = 'preset';
    var t0, t1, t2, t3, t4, t5, t6, t7;
    t0 = now();
    cy.elements().remove();
    t1 = now();
    return fetch(file).then(function(response) {
        t2 = now();
        return response.json();
    }).then(function(json) {
        t3 = now();
        var p = new Promise(function(resolve) {
            cy.one('render', function() {
                t7 = now();
                resolve();
            });
        });
        t4 = now();
        cy.add(json.elements);
        t5 = now();
        cy.fit();
        t6 = now();
        return p;
    }).then(function() {
        log('Stats for `' + file + '`:');
        logTime('removing previous graph', t1 - t0);
        logTime('fetching json', t2 - t1);
        logTime('parsing json', t3 - t2);
        logTime('adding elements', t5 - t4);
        logTime('fitting to elements', t6 - t5);
        logTime('rendering first frame', t7 - t6);
        logTime('end-to-end', t7 - t1);
        log('--');
    });
}
var now = (typeof performance !== typeof undefined ? performance.now.bind(performance) : Date.now.bind(Date));

function log(text) {
    //console.log(text);
}

function logTime(label, duration) {
    log(' - `' + label + '`: ' + Math.round(duration) + 'ms');
}
/*function runSelectedLayout() {
	var layoutName = document.getElementById('layout').value;
	var layout = cy.layout({
		name: layoutName
	});
	var t0, t1;
	cy.one('layoutstop', () => {
		t1 = now();
		log('Stats for `' + layoutName + '`:');
		logTime('layout', t1 - t0);
		log('--');
	});
	t0 = now();
	layout.run();
}*/
var t0, t1, t2, t3, t4, t5, t6, t7;

function LoadNetwork(fingerprint, table, max_connections, expand = false, genes_expand = false, reload = false) {
    $("#add_info").hide();
    exNet = null;
    $('.loader-wrap').hide();
    // toastr.clear();
    $("#loader_exnet").show();
    //console.log(fingerprint, table, max_connections, expand, genes_expand , reload );
    selected_threshold = parseInt(selected_threshold);
    //console.log("selected threshold"+selected_threshold);
    expand = selected_threshold;
    //--//console.log("after " + expand)
    max_connections = 10000;
    t0 = now();
    //exNet.elements().remove();
    t1 = now();
    table = table.replace("correlation_aspleaf_clr", "aspleaf");
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "https://api.plantgenie.org/network/network",
        data: {
            "network": table,
            "fingerprint": fingerprint,
            "max_connections": max_connections,
            "expand": Math.abs(qnorm(1 / Math.pow(10, Math.abs(selected_threshold)))),
            "genes_expand": genes_expand,
            "reload": reload,
            "private_default_gene_ids": private_default_gene_ids,
            "name": MAIN_GENELIST_TABLE,
            "table": "network"
        },
        success: function(data, status) {
            var no_of_edges = data["network"].filter(function(number) {
                if (number.group == "edges") {
                    return number;
                }
            });
            if (Number(no_of_edges.length) > 5000 && Number(no_of_edges.length) < 10000) {
                //toastr.success('You have more than 5000 edges in your network, and this might result in long rendering times.', 'Proceed with caution');
                var txt;
                var r = confirm("You have more than 5000 edges in your network, and this might result in long rendering times. Are you OK with that?");
                if (r == true) {
                    txt = "Thats fine!";
                } else {
                    txt = "No I will reduce threshold!";
                    setCookie('selected_threshold', selected_threshold - 4);
                    location.reload();
                }
            }
            //if(Number(no_of_edges.length)>3000 && Number(no_of_edges.length)<5000 ){
            //	toastr.warning('There are more than '+no_of_edges.length+' edges for selected P-value, please lower the P-value.', 'Connections limit exceeded');
            //}
            //if (Number(no_of_edges.length) > 10000) {
            //	toastr.error('You have more than 10000 edges in your network, and this might result in long rendering times.', 'Proceed with caution');
            //return true;
            //}
            var no_of_nodes = Number(data["network"].length) - parseInt(no_of_edges.length);
            //console.log(no_of_nodes);
            animateValue("no_edges", no_of_edges.length - no_of_edges.length / 2, no_of_edges.length, 1000);
            animateValue("no_nodes", no_of_nodes - no_of_nodes / 2, no_of_nodes, 1000);
            animateValue("no_edges_total", data["max_conn"] - data["max_conn"] / 2, data["max_conn"], 1000);
            if (Object.values(data.missing_genes).length > 0) {
                $("#missing-popup").show();
                $("#missing_number").html(Object.values(data.missing_genes).length);
                $("#missing_genes").html(Object.values(data.missing_genes).map((e, i) => `${i+1}.) <a target="_blank" href="/gene?id=${e}">${e}</a><br>`));
            } else {
                $("#missing-popup").hide();
                $("#missing_number").html(0);
                $("#missing_genes").html("");
            }
            t2 = now();
            network = []; //data["network"];
            exNet = CreateNetwork(network);
            exNet.elements().remove();
            exNet.add(data["network"]);
            initialize_context_menu();
            if (exNet.fit()._private.ready == true) {
                $("#loader_exnet").hide();
            }
            set_node_mouseover_event();
            runSelectedLayout();
        }
    }).then(function(data) {
        t3 = now();
        var p = new Promise(function(resolve) {
            exNet.one('render', function() {
                t7 = now();
                resolve();
            });
        });
        t4 = now();
        //  exNet.add( data.elements );
        t5 = now();
        exNet.fit();
        t6 = now();
        return p;
    }).then(function() {
        var tmpcookie = getCookie("genie_select_species");
        if (tmpcookie == "beta_plantgenie_potra_v22") {
            show_tf_genes();
        }
    });
}

function runSelectedLayout() {
    var layoutName = layout_type;
    var layout = exNet.layout({
        name: layoutName
    });
    //console.log(layout)
    var ta, tb;
    exNet.one('layoutstop', () => {
        tb = now();
    });
    ta = now();
    layout.run();
    in_ontology();
}

function select_connected_nodes() {
    var ele = exNet.edges();
    for (var i = 0; i < ele.length; i++) {
        var ele2 = exNet.nodes();
        for (var j = 0; j < ele2.length; j++) {
            if (ele[i]._private.data.source == ele2[j]._private.data.id || ele[i]._private.data.target == ele2[j]._private.data.id) {
                ele2[j].select()
            }
        }
    }
}

function select_connected_tf() {
    var ele = exNet.edges();
    for (var i = 0; i < ele.length; i++) {
        var ele2 = exNet.nodes();
        for (var j = 0; j < ele2.length; j++) {
            if (ele[i]._private.data.source == ele2[j]._private.data.id || ele[i]._private.data.target == ele2[j]._private.data.id) {
                if (ele2[j]._private.data.shape == "triangle") {
                    ele2[j].select();
                }
            }
        }
    }
}

function arr_unique(list) {
    var result = [];
    $.each(list, function(i, e) {
        if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
}