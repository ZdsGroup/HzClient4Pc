/**
 * Created by zhao on 2016/12/9.
 */

esriTileLayerXian80={

    xian80Wkid: "EPSG:2383",

    xian80WkidProj4: "+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs",

    mapResolutions: null,

    getOrigin: function (point) {
        if(point == null){
            return  [-5123200,10002100];
        }else {
            point;
        }
    },

    getResolutions:function () {
        return this.mapResolutions;
    },

    getMaxZoom: function () {
        return this.getResolutions().length;
    },

    getMinZoom: function () {
        return 1;
    },

    getCrs:function () {

        return new L.Proj.CRS(this.xian80Wkid,this.xian80WkidProj4,
            {
                origin: this.getOrigin(null),
                resolutions: this.getResolutions(),
            });
    },

    getMapOptions:function () {
        return mapOptions = {
            crs: this.getCrs(),
            attributionControl: true,
        };
    },

    //todo use ajax request map tileinfo by map url
    setMapUrl: function (mapUrl) {
        if(mapUrl=="http://106.39.231.23/ArcGIS/rest/services/HZDG/%E5%BD%B1%E5%83%8F%E5%9B%BE/MapServer"){
            this.mapResolutions=[
                529.167725002117,
                264.583862501058,
                132.291931250529,
                66.1459656252646,
                33.0729828126323,
                16.9333672000677,
                8.46668360003387,
                4.23334180001693,
                2.11667090000847,
                1.05833545000423,
                0.529167725002117,
                0.264583862501058,
                0.132291931250529];
        }else {
            this.mapResolutions=[
                2116.670900008467,
                1058.3354500042335,
                529.167725002117,
                264.583862501058,
                132.291931250529,
                66.1459656252646,
                33.0729828126323,
                16.9333672000677,
                8.46668360003387,
                4.23334180001693,
                2.11667090000847,
                1.05833545000423,
                0.529167725002117,
                0.264583862501058,
                0.132291931250529];
        }
    }
}