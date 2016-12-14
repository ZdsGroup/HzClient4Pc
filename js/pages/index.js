/**
 * Created by zhao on 2016/12/10.
 */

var myMap=null;
var myLayers=[];
//地图初始化
function pageLoadMap(mapPanelId,mapUrl,centerPoint,myStartZoom,supportName){
    esriTileLayerXian80.setMapUrl(mapUrl);
    var mapOptions=esriTileLayerXian80.getMapOptions();
    var myMaxZoom=esriTileLayerXian80.getMaxZoom();
    var myMinZoom=esriTileLayerXian80.getMinZoom();
    var tileLayer = new L.esri.tiledMapLayer({
        url: mapUrl,
        maxZoom: myMaxZoom,
        minZoom: myMinZoom,
        attribution: supportName,
    });
    addLayerToMyLayers('vector',tileLayer,'矢量','1');

    //test basemap change temp code,because two map levels count diffcult
    var mapUrl2='http://106.39.231.23/ArcGIS/rest/services/HZDG/%E5%BD%B1%E5%83%8F%E5%9B%BE/MapServer';
    esriTileLayerXian80.setMapUrl(mapUrl2);
    var mapOptions2=esriTileLayerXian80.getMapOptions();
    var myMaxZoom2=esriTileLayerXian80.getMaxZoom();
    var myMinZoom2=esriTileLayerXian80.getMinZoom();
    var tileLayer2 = new L.esri.tiledMapLayer({
        url: mapUrl2,
        maxZoom: myMaxZoom2,
        minZoom: myMinZoom2,
        attribution: supportName,
    });
    addLayerToMyLayers('raster',tileLayer2,'影像','1');
    //

    myMap = L.map(mapPanelId, mapOptions);
    myMap.addLayer(tileLayer).setView(centerPoint,myStartZoom);
    myMap.zoomControl.setPosition("topright");

    //todo  not work,need extend crs's distance funtion
    // L.control.scale().setPosition('bottomleft').addTo(myMap);
}
//底图切换组件初始化
function baseMapChangeInit() {
    var bmLayer=getLayersByType('1');
    if (bmLayer.length>0){
        var iconLayersControl = new L.Control.IconLayers(
            bmLayer,
            {
                position: 'bottomright',
                maxLayersInRow: 5
            }
        );
        iconLayersControl.addTo(myMap);
    }
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
function getLayersByType(layerType) {
    // '1': base map layer
    // 2': over layer
    var  layersT=[];
    for (var i=0; i<myLayers.length; i++){
        var type=myLayers[i].type;
        if (type==layerType){
            layersT.push(myLayers[i]);
        }
    }
    return layersT;
};

function addLayerToMyLayers(layerId,layerObj,title,layerType) {
    if (layerId!=null&&layerObj!=null&&title!=null&&layerType!=null)
    {
        var iconT='img/layer/'+layerId+'.png';
        var tempR={ title: title,
            layer: layerObj,
            icon: iconT,
            type: layerType };
        myLayers.push(tempR);
    }
}
//todo don't work
function removeMapLayer(layerId,layerAdd) {
    // var restlayer=getEsriRestDymLayer(layerAdd);
    // myMap.remove(restlayer);
    var templayer='http://106.39.231.23/ArcGIS/rest/services/HZDG/%E5%BD%B1%E5%83%8F%E5%9B%BE/MapServer/';
    myMap.eachLayer(function (layer) {
        debugger
        var tadd=layerAdd.split('#')[0];
        if (layer.service==null||layer.service.options.url==tadd){
            layer.remove();
        }
    })
}

function addMapLayer(layerId,layerAdd) {
    var restlayer=getEsriRestDymLayer(layerAdd);
    myMap.addLayer(restlayer);
}
function getEsriRestDymLayer(layerAdd) {
    var tid=layerAdd.split('#')[1];
    var tadd=layerAdd.split('#')[0];
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
                'icon':'plugins/layer/layermini.png',
                'data' : 'http://106.39.231.23/ArcGIS/rest/services/HZDG/%E6%83%A0%E5%9F%8E%E5%8C%BA%E8%A1%8C%E6%94%BF%E5%8C%BA%E5%88%92/MapServer#0'
            }],
        },
        { 'id' :'id2',
            'text' : '水务专题服务',
            'children':[{
                'id' :'id21',
                'text' : '水源保护区',
                'icon':'plugins/layer/layermini.png',
                'data' : 'http://106.39.231.23/ArcGIS/rest/services/HZDG/%E6%B0%B4%E6%BA%90%E4%BF%9D%E6%8A%A4%E5%8C%BA/MapServer#1'
            }],
        },
    ]}
];
