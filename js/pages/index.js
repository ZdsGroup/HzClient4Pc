/**
 * Created by zhao on 2016/12/10.
 */

//地图初始化
function pageLoadMap(mapId,mapUrl,centerPoint,myStartZoom,supportName){
    esriTileLayerXian80.setMapUrl(mapUrl);
    var mapOptions=esriTileLayerXian80.getMapOptions();
    var myMaxZoom=esriTileLayerXian80.getMaxZoom();
    var myMinZoom=esriTileLayerXian80.getMinZoom();
    var map = L.map(mapId, mapOptions);
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
        'width': '220px',
        'background':'#FFFFFF',
        'focusColor':'#B2E7FF',
        'borderRadius':'5px',
        'top': '0',
        'left': '190',
        'border':'2px solid #4280ed'
    });
    $('#layerContainer').jstree({'plugins':["wholerow","checkbox"],
        'core' : {
            'data' : [
                { "text" : "水务专题服务", "children" : [
                    { "text" : "水源保护区" },
                    { "text" : "水源取水口" },
                ]}
            ]
        }
    });
}
