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
