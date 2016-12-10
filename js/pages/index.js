/**
 * Created by zhao on 2016/12/10.
 */

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
    L.control.scale().setPosition('bottomleft').addTo(map);
}
