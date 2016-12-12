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
        'width': '200px',
        'background':'#e67e22',
        'focusColor':'#c0392b',
        'borderRadius':'10px',
        'top': '20',
        'left': '170',
        'border':'3px solid #d2527f'
    });
    $('#layerContainer').jstree({'plugins':["wholerow","checkbox"],
        'core' : {
            'data' : [
                { "text" : "Root node", "children" : [
                    { "text" : "Child node 1" },
                    { "text" : "Child node 2" }
                ]}
            ]
        }
    });
}
