/**
 * Created by zhao on 2016/12/10.
 */

var map=null;
//地图初始化
function pageLoadMap(mapId,mapUrl,centerPoint,myStartZoom,supportName){
    esriTileLayerXian80.setMapUrl(mapUrl);
    var mapOptions=esriTileLayerXian80.getMapOptions();
    var myMaxZoom=esriTileLayerXian80.getMaxZoom();
    var myMinZoom=esriTileLayerXian80.getMinZoom();

    map = L.map(mapId, mapOptions);
    // L.esri.support.cors=false;
    var tileLayer = new L.esri.tiledMapLayer({
        url: mapUrl,
        maxZoom: myMaxZoom,
        minZoom: myMinZoom,
        attribution: supportName,
    });
    map.addLayer(tileLayer).setView(centerPoint,myStartZoom);
    map.zoomControl.setPosition("topright");

    //todo  not work,need extend crs's distance funtion
    // L.control.scale().setPosition('bottomleft').addTo(map);
}
//查询插件初始化
function searchPanelInit() {
    var searchText = [
        "您想知道什么信息?",
        "检索四规水务信息从这里开始",
    ];
    $('#search').placeholderTypewriter({text: searchText});
}
//图层组件初始化
function layerPanelInit() {
    $('#layerPanel').popmenu({
        'width': '240px',
        'background':'#FFFFFF',
        'focusColor':'#B2E7FF',
        'borderRadius':'5px',
        'top': '0',
        'left': '200',
        'border':'2px solid #4280ed'
    });
    $('#layerContainer').jstree({'plugins':["wholerow","checkbox"],
        'core' : {
            'data' :layerData,
        }
    });
    $('#layerContainer').on("changed.jstree", function (e, data) {
        if (data.node!=null){
           var actid=data.action;
           var layerId=data.node.id;
           var layerAdd=data.node.data;
           if (actid=="deselect_node"){
               removeMapLayer(layerId,layerAdd);
           }else if (actid=="select_node"){

               addMapLayer(layerId,layerAdd);
           }
        }
    });
}

function removeMapLayer(layerId,layerAdd) {
    var restlayer=getEsriRestDymLayer(layerAdd);
    map.remove(restlayer);
}

function addMapLayer(layerId,layerAdd) {
    var restlayer=getEsriRestDymLayer(layerAdd);
    map.addLayer(restlayer);
}
function getEsriRestDymLayer(layerAdd) {
    var tid=layerAdd.split('#')[1];
    var tadd=layerAdd.split('#')[0];
    var myMaxZoom=esriTileLayerXian80.getMaxZoom();
    var myMinZoom=esriTileLayerXian80.getMinZoom();
    var restlayer = new L.esri.dynamicMapLayer({
        url: tadd,
        layers:[0,1],
        opacity : 0.9
    });
    return restlayer;
}

//all temp date
var layerData=[
    { 'text' : '服务目录', 'children' : [
        { 'id' :'id1',
            'text' : '基础服务',
            'children':[{
                'id' :'id11',
                'text' : '惠城区行政区划',
                'data' : 'http://106.39.231.23/ArcGIS/rest/services/HZDG/%E6%83%A0%E5%9F%8E%E5%8C%BA%E8%A1%8C%E6%94%BF%E5%8C%BA%E5%88%92/MapServer#0'
            }],
        },
        { 'id' :'id2',
            'text' : '水务专题服务',
            'children':[{
                'id' :'id21',
                'text' : '水源保护区',
                'data' : 'http://106.39.231.23/ArcGIS/rest/services/HZDG/%E6%B0%B4%E6%BA%90%E4%BF%9D%E6%8A%A4%E5%8C%BA/MapServer#1'
            }],
        },
    ]}
];
