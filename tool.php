   <!--<span style="float: right;color: red">&copy;</span><div id="exNet_main"></div>-->
   <meta charset="UTF-8"> 
    	<link href="plugins/venn/css/bootstrap.css" rel="stylesheet" media="screen">
    <link rel="stylesheet" type="text/css" href="plugins/exnet/css/cytoscape.css">
  <link rel="stylesheet" type="text/css" href="plugins/exnet/javascript/qtip/jquery.qtip.min.css">
        <link rel="stylesheet" type="text/css" href="plugins/exnet/css/cytoscape-context-menus.css">
        <link rel="stylesheet" type="text/css" href="plugins/exnet/css/spectrum.css">
   <script src="plugins/exnet/js/bluebird.min.js"></script>
    <script src="plugins/exnet/js/fetch.js"></script>

    <script src="plugins/exnet/js/cytoscape.min.js"></script>

    <script src="plugins/exnet/js/cola.min.js"></script>
    <script src="plugins/exnet/js/cytoscape-cola.js"> </script>


    <script src="plugins/exnet/js/layout-base.js"></script>
    <script src="plugins/exnet/js/cose-base.js"></script>


    <script src="plugins/exnet/js/cytoscape-cose-bilkent.js"> </script>

    <script src="plugins/exnet/js/dagre.js"></script>
    <script src="plugins/exnet/js/cytoscape-dagre.js"> </script>

    <script src="plugins/exnet/js/cytoscape-euler.js"> </script>

    <script src="plugins/exnet/js/klay.js"></script>
    <script src="plugins/exnet/js/cytoscape-klay.js"> </script>

		<script src="plugins/exnet/js/weaver.min.js"></script>
    <script src="plugins/exnet/js/cytoscape-spread.js"></script>

    <script src="plugins/exnet/js/springy.js"></script> 
    <script src="plugins/exnet/js/cytoscape-springy.js"></script>

    <script src="plugins/exnet/javascript/node_modules/cytoscape-cxtmenu/cytoscape-cxtmenu.js"></script> 
    <script src='plugins/exnet/javascript/qtip/jquery.qtip.min.js'></script>

    <script src='plugins/exnet/javascript/qtip/cytoscape.js-qtip/cytoscape-qtip.js'></script>
    <script src='plugins/exnet/javascript/cytoscape-context-menus.js'></script>
     <script src='plugins/exnet/javascript/jquery.cytoscape.js-panzoom.js'></script>
   <link rel="stylesheet" type="text/css" href="plugins/exnet/css/jquery.cytoscape.js-panzoom.css">
   <script src="plugins/exnet/js/spectrum.js"></script>
   
    <script src="js/api.js"></script>
    
    
 
    
    <div style="position:absolute; width:80%;z-index: 9 ">  <img id="loader_exnet" src="plugins/exnet/img/loader.gif" style="display: block;margin-left: auto;margin-right: auto;"/>
  </div>
    
     
    <div id="exNet">
    	<div style="display: none" id="network_info_text" class="nwinfobox"></div>
    	<div style="display: none" id="network_info_text2" class="nwinfobox"></div>
    </div>
 <button id="show_hide_label"  class="btn  btn-primary"	onclick='hide_label()' style="position:relative;margin-top: -40px;float: right;margin-right:160px;outline: none;cursor: pointer;font-size: 16px;line-height: 24px ">Hide Labels</button>
    
    <div id="add_info"  style="width:400px;height:400px;background-color: rgba(0, 0, 0, 0.6);;position:relative;margin-top: -470px;float: right;margin-right:20px;display: none;color: white;padding: 14px;border-radius: 4px;font-family: Consolas, Andale Mono, Lucida Console, Lucida Sans Typewriter, Monaco, Courier New, monospace;padding-bottom: 0px;  overflow: hidden;">
    <span onClick="hide_info();" style="cursor: pointer;font-size: 20px;float: right;p ">&times;</span><span onClick="hide_info_forever();" style="cursor: pointer;font-size: .8em;float: right;bottom: 4px;position: absolute;right: 4px; ">Don't show this again</span>
    	<div id="add_info_span" style="width: 100%;height:400px;overflow: auto;"></div>
    </div>
    
    
    
    <button id="t_p_z" style="position:relative;margin-top: -40px;float: right;margin-right:20px;outline: none;cursor: pointer;font-size: 16px;line-height: 24px" onClick="toggle_pan_zoom();">Zoom Disabled</button>
	    <img width="200px" height="200px;" style="position: absolute;top: 780px" src="plugins/exnet/img/shape_legend.svg" alt="Node shapes" >
<div class="grid-row">
    <div class="item">
        <br>
    <select  id="select_table">
   	
	</select>
        <select id="select_layout_table">
        
     <option value="cose-bilkent">Cose-Bilkent (Looks better)</option>
                <option value="cose">Cose (Quicker)</option>
                <option value="concentric">concentric (Nodes in concentric circles)</option>
   <!--  
        <option value="random">random (Nodes in random positions)</option>
        <option value="grid">grid (Nodes in a well-spaced grid)</option>
   <option value="circle">circle (Nodes in a circle)</option>
     
        <option value="breadthfirst">breadthfirst (Nodes in a hierarchy)</option>
        <option value="dagre">dagre (Nodes in a trees)</option>
        <option value="klay">klay (Ordinary graphs)</option>
        <option value="cola">cola (Force-directed layout)</option>
        <option value="euler">euler (High-quality force-directed )</option>
        <option value="spread">spread (Force-directed simulation layout)</option>
        <option value="springy">springy (physics simulation layout)</option>-->



	</select>
       <br>
        <button id="create_new" class="btn btn-primary" >Create a new GeneList</button>
         <button id="expandbutton" class="btn btn-primary"   onclick='exnet_expand()' >Expand network</button>
       

       <div style="height:6px;"><br></div>



<button id="exnet_add" class="btn btn-primary"   onclick='add_gene_to_list()' >Add selected genes to your gene list</button>
<button id="exportbutton" class="btn btn btn-primary"   onclick='export_network()' >Download network</button>


<br>
     </div>
    <div class="item">
        <br>
        <table width="90%">
            <tr>
                <td width="180px" style="vertical-align: top;"> <span style="margin-top: -10px" id="th2_span_lbl">Selected p-value:</span><span id="th2_span"></span> <br>
                 <span id="ratio_span"></span></td>
                 
                <!--<td><span style="float: left;margin-top: :40px">A</span> <div style="width:100%" id="threshold_slider"></div><span style="float: right">B</span> </td>-->
             <td >   
                
                <div class="slider-range-wrap">
    <div id="threshold_slider"></div>
    <span class="min-range"></span>
    <span class="max-range"></span>
</div></td>
                
                 <!--<?php $ipaddress = $_COOKIE['genie_select_species'];if($ipaddress!="explorer_aspleaf_potra_v11"){?>
                <td > <input data-slider="true" class="slider" data-slider-range="3,10" id="input_expand" name="th2" data-slider-step="1" value="5" type="text" data-slider-snap="true" data-slider-highlight="true" /> </td>
                <?php } ?>
                 <?php $ipaddress = $_COOKIE['genie_select_species'];if($ipaddress=="explorer_aspleaf_potra_v11"){?>
                  <td > <input data-slider="true" class="slider" data-slider-range="0,1" id="input_expand" name="th2" data-slider-step=".1" value=".5" type="text" data-slider-snap="true" data-slider-highlight="true" /> </td>
                  <?php } ?>-->
            </tr>
            <tr style="display: none" >
                <td  width="200px">Visual threshold:<span id="th1_span">(>=0)</span> </td>
                <td > <input data-slider="true" class="slider" data-slider-range="5,10" id="input_visual" name="th1" data-slider-step="1" value="5" type="text" data-slider-snap="true" data-slider-highlight="true" /> </td>
            </tr>
        </table><br>
        <button id="select_connected" class="btn btn-inverse"   onclick='select_connected_nodes()' >Select connected nodes</button>
        <button id="exnet_selectall" class="btn btn-inverse"   onclick='exNet.nodes().select();' >Select all genes</button><br><br>
<button id="select_connected_tf" class="btn btn-inverse"   onclick='select_connected_tf()' >Select connected transcription factors</button>
   <button class="btn btn-inverse"   onclick='out_ontology()' >Reset node color</button>
    </div>
    <div class="item"> 
          <br>
           <table style="display: none" width="88%">
            <td width="228px">Max number of edges:<span id="get_edges_span">(<=2000)</span></td>
            <td > <input data-slider="true" class="slider" data-slider-range="1,8000" id="max_connections_slider" name="get_edges" data-slider-step="10" value="2000" type="text" data-slider-snap="true" data-slider-highlight="true" /></td>
        </table>
<!--       <i class="fa fa-repeat fa-2x reloadbutton" onclick='reload2()' title="Reload network" aria-hidden="true"></i> <i class="fa fa-search fa-2x reloadbutton" onclick='toggle_zoom()' title="Toggle zoom" aria-hidden="true"></i>-->
        <!--<div style="left: 200px;" id="expand_message"></div>-->
        <table width="88%">
        <td width="60px"> No of edges: <span style="font-size: 16px;color: red" id="no_edges"></span> <span style="font-size: 16px;color: red;display: none" id="no_edges_total"></span></td>
        <td width="60px"> No of nodes: <span style="font-size: 26px;color: red" id="no_nodes"></span></td>
         </table>
         <input  onchange="toggle_check(this)" id="info_window_chkbox"  type="checkbox" > <font style="color:red;font-weight:bold" >Show gene information pop-up window</font></checkbox> <br><br>

         Color selected nodes: 
         <input type='text' id="custom" />
    
       
       <br>
    
       <span  style='font-size:12px;bottom: 10px;display:none'>  Network was cacluated using <a href="https://seidr.readthedocs.io/en/latest/source/backbone/backbone.html" target="_blank">Seidr</a></span> 
	
   <br>
    
   
    </div> 
</div> 

  <?php	include_once("plugins/missing_genes/tool.php");?>
  
 <!--	    <?php $ipaddress = $_COOKIE['genie_select_species'];if($ipaddress=="explorer_aspleaf_potra_v11"){
	print "<h4><font color='red'>Expression value was wrongly calculated for <i>Populus tremula</i>. Please refer <a target='_blank' href='http://Aspleaf.plantgenie.org'>Aspleaf </a> for the correct network.</font></h4>";	
}else{print "";}?> -->
 	<script src='plugins/exnet/javascript/cytoscape-svg-convertor.js'></script>
	<script type="application/javascript" src='plugins/exnet/javascript/cytoscape-cy-svg-convertor.js'></script>
	<script src='plugins/exnet/javascript/svg.js'></script> 
	<script src="plugins/exnet/javascript/simple-slider.js"></script>
	<script src="plugins/exnet/javascript/init.js"></script> 
	<!--<script src="plugins/exnet/javascript/slider.js"></script>-->
       <br>

       <script src="<?php print $GLOBALS['base_url']?>/plugins/tour/poptour.js"></script>
<script src="<?php print $GLOBALS['base_url']?>/plugins/tour/exnet.js"></script>
 			