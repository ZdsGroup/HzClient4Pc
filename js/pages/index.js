/**
 * Created by zhao on 2016/12/10.
 */

var myMap = null;
var myLayers = [];
var myQueryLayerGroup = new L.layerGroup();
var myQueryHighLayerGroup = new L.layerGroup();
var myMarkHigh = null;
var maxZoomShow = 8;

var demoLayerKey = 'demolayer';

// userkey-gxuser:
var userkey = '19f09930757f2caf935eed597a70811cee748db3';
var queryUrlTemplate = 'http://220.231.19.115:2498/{0}/ArcGIS/MapService/Catalog/{1}.gis';
// '1': base map layer
// 2': over layer
var baseLayerType = '1';
var overLayerType = '2';

//地图初始化
function pageLoadMap(mapPanelId, mapUrl, centerPoint, myStartZoom, supportName) {
    esriTileLayerXian80.setMapUrl(mapUrl);
    var mapOptions = esriTileLayerXian80.getMapOptions();
    var myMaxZoom = esriTileLayerXian80.getMaxZoom();
    var myMinZoom = esriTileLayerXian80.getMinZoom();
    var tileLayer = new L.esri.tiledMapLayer({
        url: mapUrl,
        maxZoom: myMaxZoom,
        minZoom: myMinZoom,
        attribution: supportName
    });
    addLayerToMyLayers('vector', tileLayer, '矢量', baseLayerType);

    //test basemap change temp code,because two map levels count diffcult
    var mapUrl2 = 'http://106.39.231.23/ArcGIS/rest/services/HZDG/%E5%BD%B1%E5%83%8F%E5%9B%BE/MapServer';
    esriTileLayerXian80.setMapUrl(mapUrl2);
    var mapOptions2 = esriTileLayerXian80.getMapOptions();
    var myMaxZoom2 = esriTileLayerXian80.getMaxZoom();
    var myMinZoom2 = esriTileLayerXian80.getMinZoom();
    var tileLayer2 = new L.esri.tiledMapLayer({
        url: mapUrl2,
        maxZoom: myMaxZoom2,
        minZoom: myMinZoom2,
        attribution: supportName
    });
    addLayerToMyLayers('raster', tileLayer2, '影像', baseLayerType);
    //


    myMap = L.map(mapPanelId, mapOptions);
    myMap.addLayer(tileLayer).setView(centerPoint, myStartZoom);
    myMap.zoomControl.setPosition("topright");
    myMap.attributionControl.setPrefix(false);

    //todo  not work,need extend crs's distance funtion
    // L.control.scale().setPosition('bottomleft').addTo(myMap);
}
//底图切换组件初始化
function baseMapChangeInit() {
    var bmLayer = getLayersByType(baseLayerType);
    if (bmLayer.length > 0) {
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
        "检索从这里开始",
    ];
    $('#searchTxt').placeholderTypewriter({text: searchText});
    $('#searchBt').on('click', queryLayerObjs);
}
function queryLayerObjs() {
    var keyWords = $('#searchTxt')[0].value.trim();
    var layerIds = getSelOverLayerIds();
    if (keyWords != '' && layerIds.length > 0) {
        $('#loadingPanel').loader('show');
        L.esri.Support.cors = false;
        var queryEnable = false;
        for (var i = 0; i < layerIds.length; i++){
            if(layerIds[i].indexOf('SDE') < 0){
                continue;
            }
            queryEnable = true;

            // demo data query and show for temp start
            var layerT = getLayerByLayerId(layerIds[i]);
            if (layerT.layer.options.url.indexOf(demoLayerKey) >= 0){
                var redIcon = L.icon({
                    iconUrl: 'libs/leaflet/images/marker-red.png',
                    shadowUrl: 'libs/leaflet/images/marker-shadow.png',
                    iconSize:    [25, 41],
                    iconAnchor:  [12, 41],
                    popupAnchor: [1, -34],
                    tooltipAnchor: [16, -28],
                    shadowSize:  [41, 41]

                });
                myQueryLayerGroup.clearLayers();
                if (resultsData.length > 0){
                    var count = resultsData.length;
                    for (var i = 0; i < count; i++){
                        var lat = resultsData[i].x;
                        var lng = resultsData[i].y;
                        var msg = getDemoDataMsg(resultsData[i]);
                        var name = resultsData[i].name;
                        if(lat != '' && lng != ''){
                            var mark = new L.marker([lat, lng]).bindPopup(msg).bindTooltip(name, {className: 'query-marker-tooltip', permanent: true});
                            myQueryLayerGroup.addLayer(mark);
                        }
                    }
                }
                myMap.addLayer(myQueryLayerGroup);
                myMap.setView(L.latLng(resultsData[0].x, resultsData[0].y), maxZoomShow);
                $('#loadingPanel').loader('hide');
                continue;
            }
            // demo data query and show for temp end

            var queryUrl = stringFormat(queryUrlTemplate, userkey, layerIds[i]);
            var whereStr = "OBJECTID<20";
            if (layerIds[i] == 'SDE.BKYDWW'){
                whereStr = "文物点名称 like '%" +keyWords+ "%'";
            }
            L.esri.query({
                url: queryUrl
            }).where(whereStr).run(function (errMsg, queryResults, response) {
                $('#loadingPanel').loader('hide');
                if(!errMsg){
                    showQueryResults(queryResults, response);
                }else {
                    messageShow('warn', errMsg.message);
                }
            });
        }
        if (!queryEnable){
            messageShow('warn', '请选择可以查询的图层!');
        }
    }else {
        messageShow('warn', '请输入关键字并且选择叠加的图层!');
    }
}
function getSelOverLayerIds() {
    var ids = [];
    var layers = getLayersByType(overLayerType);
    for (var i = 0; i < layers.length; i++){
        ids.push(layers[i].id);
    }
    return ids;
}
function showQueryResults(results, resContext) {
    if (!(results.features != null && results.features.length > 0)) {
        messageShow('warn', '没有查询到结果')
    } else {
        var redIcon = L.icon({
            iconUrl: 'libs/leaflet/images/marker-red.png',
            shadowUrl: 'libs/leaflet/images/marker-shadow.png',
            iconSize:    [25, 41],
            iconAnchor:  [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize:  [41, 41]

        });
        myQueryLayerGroup.clearLayers();
        myQueryHighLayerGroup.clearLayers();
        var NameStr = resContext.displayFieldName;
        var displayFieldNameStrs = getFieldNames(resContext.fields);
        var queryR = L.geoJSON(results, {
            pointToLayer: function (geoJsonPoint, latlng) {
                var name = getFeatureName(NameStr, geoJsonPoint.properties);
                var msg = getFeatureMsg(displayFieldNameStrs, geoJsonPoint.properties);
                return L.marker(latlng).bindPopup(msg).bindTooltip(name, {className: 'query-marker-tooltip'});
            },
            style: function (feature) {
                return {color: '#291eed'};
            },
            onEachFeature: function (jsonfeature, layer) {
                layer.on('click', function (e) {
                    var name = getFeatureName(NameStr, e.target.feature.properties);
                    var msg = getFeatureMsg(displayFieldNameStrs, e.target.feature.properties);
                    myQueryHighLayerGroup.clearLayers();
                    if(e.target.feature.geometry.type != 'Point'){
                        var mark = new L.marker(e.latlng).bindPopup(msg).bindTooltip(name, {className: 'query-marker-tooltip'});
                        var selObj = L.geoJSON(e.target.feature, { style: function (feature) {
                                return {color: 'red'};
                            },});
                        myQueryHighLayerGroup.addLayer(selObj);
                        myQueryHighLayerGroup.addLayer(mark);
                        mark.openPopup();
                        myMap.fitBounds(e.target._bounds, {maxZoom:maxZoomShow});
                    }else {
                        if(myMarkHigh && myMarkHigh._leaflet_id != this._leaflet_id){
                            myMarkHigh.setIcon(new L.Icon.Default());
                        }
                        this.setIcon(redIcon);
                        this.openPopup();
                        myMarkHigh = this;
                        myMap.setView(e.latlng, maxZoomShow);
                    }
                });
                layer.bindTooltip(getFeatureName(NameStr, layer.feature.properties), {className: 'query-marker-tooltip'});
            }
        });
        myQueryLayerGroup.addLayer(queryR);
        myMap.addLayer(myQueryLayerGroup);
        myMap.addLayer(myQueryHighLayerGroup);
        myMap.fitBounds(queryR.getBounds(),{maxZoom:maxZoomShow});
    }
}

function getFieldNames(fieldsArr) {
    var count = fieldsArr.length;
    var arrT = [];
    for (var i =0; i < count; i++){
        arrT.push(fieldsArr[i].name);
    }
    return arrT;
}

function getFeatureName(fieldStr, context) {
    var tempStr = '';
    tempStr = fieldStr + ': ' + context[fieldStr];
    return tempStr;
}

function getFeatureMsg(fieldStrs, context) {
    var tempStr = '';
    var count = fieldStrs.length;
    for (var i = 0; i < count; i++){
        var str = fieldStrs[i];
        tempStr = tempStr + str + ': ' + context[str];
        if (i != count-1){
            tempStr = tempStr + '</br>';
        }
    }
    return tempStr;
}

function stringFormat() {
    if (arguments.length == 0)
        return null;
    var str = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
        str = str.replace(re, arguments[i]);
    }
    return str;
}

function messageShow(msgType, msginfo) {
    $("body").overhang({
        type: msgType,  //"warn"
        message: msginfo,
        duration: 3,
        closeConfirm: false
    });
}

//图层组件初始化
function layerPanelInit() {
    $('#layerPanel').popmenu({
        'width': '260px',
        'background': '#FFFFFF',
        'focusColor': '#B2E7FF',
        'borderRadius': '5px',
        'top': '0',
        'left': '200',
        'border': '2px solid #4280ed'
    });
    $('#layerContainer').jstree({
        'plugins': ["wholerow", "checkbox"],
        'core': {
            'data': layerData,
        }
    });
    $('#layerContainer').on("changed.jstree", function (e, data) {
        if (data!=null && data.node != null) {
            var actid = data.action;
            var layerId = data.node.id;
            var layerTxt = data.node.text;
            var layerAdd = data.node.data;
            if (actid == "deselect_node") {
                removeMapOverLayer(layerId, layerAdd);
            } else if (actid == "select_node") {
                addMapOverLayer(layerId, layerTxt, layerAdd);
            }
            if (data.node.children){
                for (var i=0;i<data.node.children.length;i++){
                    var nodeT=$('#layerContainer').jstree(true).get_node(data.node.children[i]);
                    keepFindLayer(nodeT, actid);
                }
            }
        }
    });
}

function keepFindLayer(nodeObj, actionId) {
    if (nodeObj){
        var layerAdd = nodeObj.data;
        if (layerAdd){
            var layerId = nodeObj.id;
            var layerTxt = nodeObj.text;

            if (actionId == "deselect_node") {
                removeMapOverLayer(layerId, layerAdd);
            } else if (actionId == "select_node") {
                addMapOverLayer(layerId, layerTxt, layerAdd);
            }
        }else if (nodeObj.children != null){
            for (var i=0;i<nodeObj.children.length;i++){
                var nodeT=$('#layerContainer').jstree(true).get_node(nodeObj.children[i]);
                keepFindLayer(nodeT, actionId);
            }
        }
    }
}

function getLayersByType(layerType) {
    var layersT = [];
    for (var i = 0; i < myLayers.length; i++) {
        var type = myLayers[i].type;
        if (type == layerType) {
            layersT.push(myLayers[i]);
        }
    }
    return layersT;
};

function getLayerByLayerId(id) {
    var layerT = null;
    for (var i = 0; i < myLayers.length; i++) {
        var idT = myLayers[i].id;
        if (idT == id) {
            layerT = myLayers[i];
        }
    }
    return layerT;
};

function addLayerToMyLayers(layerId, layerObj, title, layerType) {
    if (layerId != null && layerObj != null && title != null && layerType != null) {
        var iconT = 'img/layer/' + layerId + '.png';
        var tempR = {
            id: layerId,
            title: title,
            layer: layerObj,
            icon: iconT,
            type: layerType
        };
        myLayers.push(tempR);
    }
}

function removeLayerFromMyLayers(layerId) {
    if (layerId != null) {
        for (var i = 0; i < myLayers.length; i++) {
            if (layerId == myLayers[i].id) {
                myLayers.splice(i, 1);
                break;
            }
        }
    }
}

function removeMapOverLayer(layerId, layerAdd) {
    var layerT = getLayerByLayerId(layerId);
    if (layerT) {
        myMap.removeLayer(layerT.layer);
        removeLayerFromMyLayers(layerId);
    }
}

function addMapOverLayer(layerId, layerTxt, layerAdd) {
    var restlayer = getEsriRestDymLayer(layerAdd);
    if (restlayer){
        if(layerAdd != 'demolayer'){
            myMap.addLayer(restlayer);
        }
        addLayerToMyLayers(layerId, restlayer, layerTxt, overLayerType);
    }
}

function getEsriRestDymLayer(layerAdd) {
    var tid = null;
    var tadd = null;
    var restlayer = null;
    if (layerAdd)
    {
        if(layerAdd.indexOf('#')>0){
            tid = layerAdd.split('#')[1];
            tadd = layerAdd.split('#')[0];
        }else {
            tadd = layerAdd;
        }
        restlayer = new L.esri.dynamicMapLayer({
            url: tadd,
            layers: [0, 1],
            opacity: 0.9
        });
    }
    return restlayer;
}

//工具条组件初始化
function toolBarInit() {
    changeDrawLocalMsg();
    var editableLayers = new L.FeatureGroup();
    myMap.addLayer(editableLayers);
    var options = {
        position: 'topright',
        draw: false,
        measure: {
            dismeasure: {
                shapeOptions: {
                    color: '#f10215',
                    weight: 3,
                    opacity: 0.8
                }
            },
            areameasure: {
                shapeOptions: {
                    color: '#f10215',
                    weight: 3,
                    opacity: 0.8
                }
            },
            clearshapes: {
                featureGroup: editableLayers
            }
        }
    };
    var drawControl = new L.Control.Draw(options);
    myMap.addControl(drawControl);
    myMap.on(L.Draw.Event.CREATED, function (e) {
        var type = e.layerType,
            layer = e.layer;
        editableLayers.addLayer(layer);
    });
}

function changeDrawLocalMsg() {
    L.drawLocal.draw.handlers.polyline.tooltip.start = '单击确定起点';
    L.drawLocal.draw.handlers.polyline.tooltip.cont = '单击确定地点';
    L.drawLocal.draw.handlers.polyline.tooltip.end = '单击确定地点，双击结束';

    L.drawLocal.draw.handlers.polygon.tooltip.start = '单击确定起点';
    L.drawLocal.draw.handlers.polygon.tooltip.cont = '单击确定地点';
    L.drawLocal.draw.handlers.polygon.tooltip.end = '单击确定地点，双击结束';

    L.drawLocal.draw.toolbar.finish.title = '结束测量';
    L.drawLocal.draw.toolbar.finish.text = '结束';

    L.drawLocal.edit.handlers.remove.tooltip.text = '单击对象删除，ESC键结束';
}

//all temp date

var layerData = [
    {   'id': 'root',
        'type': 'fold',
        'text': '专题应用服务', 'children': [
        {
            'id': 'id1',
            'type': 'fold',
            'text': '环保',
            'children': [{
                    'id': 'SDE.BKYDWW',
                    'type': 'leaf',
                    'text': '不可移动文物',
                    'icon': 'img/layer/layermini.png',
                    'data': 'http://106.39.231.23/ArcGIS/rest/services/HZDG/%E6%B0%B4%E6%BA%90%E4%BF%9D%E6%8A%A4%E5%8C%BA/MapServer'
                },
                {
                    'id': 'SDE.JSYDGMKZX',
                    'type': 'leaf',
                    'text': '生态严控区',
                    'icon': 'img/layer/layermini.png',
                    'data': 'http://106.39.231.23/ArcGIS/rest/services/HZDG/STYKQ/MapServer'
                }
            ],
        },
        {
            'id': 'id2',
            'type': 'fold',
            'text': '水务',
            'children': [{
                    'id': 'SDE.BLUE',
                    'type': 'leaf',
                    'text': '蓝线规划',
                    'icon': 'img/layer/layermini.png',
                    'data': 'http://106.39.231.23/ArcGIS/rest/services/HZDG/LXGH/MapServer'
                },
                {
                    'id': 'id21',
                    'type': 'fold',
                    'text': '河湖',
                    'children': [{
                            'id': 'id211',
                            'type': 'leaf',
                            'text': '湖泊',
                            'icon': 'img/layer/layermini.png',
                            'data': ''
                        },
                        {
                            'id': 'id212',
                            'type': 'leaf',
                            'text': '河流',
                            'icon': 'img/layer/layermini.png',
                            'data': ''
                        }
                    ]
                },
                {
                    'id': 'id22',
                    'type': 'fold',
                    'text': '水利工程',
                    'children': [{
                            'id': 'SDE.P201',
                            'type': 'leaf',
                            'text': '水库工程',
                            'icon': 'img/layer/layermini.png',
                            'data': demoLayerKey
                        },
                        {
                            'id': 'id222',
                            'type': 'leaf',
                            'text': '水电站工程',
                            'icon': 'img/layer/layermini.png',
                            'data': ''
                        },
                        {
                            'id': 'id223',
                            'type': 'leaf',
                            'text': '水闸工程',
                            'icon': 'img/layer/layermini.png',
                            'data': ''
                        },
                        {
                            'id': 'id224',
                            'type': 'leaf',
                            'text': '橡胶坝',
                            'icon': 'img/layer/layermini.png',
                            'data': ''
                        },
                        {
                            'id': 'id225',
                            'type': 'leaf',
                            'text': '泵站工程',
                            'icon': 'img/layer/layermini.png',
                            'data': ''
                        },
                        {
                            'id': 'id226',
                            'type': 'leaf',
                            'text': '引调水工程',
                            'icon': 'img/layer/layermini.png',
                            'data': ''
                        },
                        {
                            'id': 'id227',
                            'type': 'leaf',
                            'text': '提防工程',
                            'icon': 'img/layer/layermini.png',
                            'data': ''
                        },
                        {
                            'id': 'id228',
                            'type': 'leaf',
                            'text': '农村供水工程',
                            'icon': 'img/layer/layermini.png',
                            'data': ''
                        }
                    ]
                },
                {
                    'id': 'id23',
                    'type': 'fold',
                    'text': '经济社会用水',
                    'children': [{
                            'id': 'id231',
                            'type': 'leaf',
                            'text': '规模化畜禽养殖场',
                            'icon': 'img/layer/layermini.png',
                            'data': ''
                        },
                        {
                            'id': 'id232',
                            'type': 'leaf',
                            'text': '公共供水企业',
                            'icon': 'img/layer/layermini.png',
                            'data': ''
                        },
                        {
                            'id': 'id233',
                            'type': 'leaf',
                            'text': '工业企业',
                            'icon': 'img/layer/layermini.png',
                            'data': ''
                        }
                    ]
                },
                {
                    'id': 'id24',
                    'type': 'fold',
                    'text': '河湖开发治理保护',
                    'children': [{
                            'id': 'id241',
                            'type': 'leaf',
                            'text': '河湖取水口',
                            'icon': 'img/layer/layermini.png',
                            'data': ''
                        },
                        {
                            'id': 'id242',
                            'type': 'leaf',
                            'text': '地表水水源地',
                            'icon': 'img/layer/layermini.png',
                            'data': ''
                        },
                        {
                            'id': 'id243',
                            'type': 'leaf',
                            'text': '入河湖排污口',
                            'icon': 'img/layer/layermini.png',
                            'data': ''
                        }
                    ]
                },
                {
                    'id': 'id25',
                    'type': 'fold',
                    'text': '水土保持',
                    'children': [{
                            'id': 'id251',
                            'type': 'leaf',
                            'text': '治沟骨干工程',
                            'icon': 'img/layer/layermini.png',
                            'data': ''
                        }
                    ]
                },
                {
                    'id': 'id26',
                    'type': 'fold',
                    'text': '水利行业能力建设',
                    'children': [{
                            'id': 'id261',
                            'type': 'leaf',
                            'text': '水利行业单位',
                            'icon': 'img/layer/layermini.png',
                            'data': ''
                        },
                        {
                            'id': 'id262',
                            'type': 'leaf',
                            'text': '水利行政机关',
                            'icon': 'img/layer/layermini.png',
                            'data': ''
                        },
                        {
                            'id': 'id263',
                            'type': 'leaf',
                            'text': '水利事业单位',
                            'icon': 'img/layer/layermini.png',
                            'data': ''
                        }
                    ]
                }
            ],
        },
        {
            'id': 'id3',
            'type': 'fold',
            'text': '交通',
            'children': [{
                    'id': 'SDE.CGGLZG',
                    'type': 'leaf',
                    'text': '城市总体规划',
                    'icon': 'img/layer/layermini.png',
                    'data': 'http://106.39.231.23/ArcGIS/rest/services/HZDG/%E6%80%BB%E4%BD%93%E8%A7%84%E5%88%92/MapServer'
                },
                {
                    'id': 'id32',
                    'type': 'leaf',
                    'text': '公交线路',
                    'icon': 'img/layer/layermini.png',
                    'data': ''
                }
            ],
        },
        {
            'id': 'id4',
            'type': 'fold',
            'text': '发改',
            'children': [{
                'id': 'id41',
                'type': 'leaf',
                'text': '主体功能区',
                'icon': 'img/layer/layermini.png',
                'data': ''
                },
                {
                    'id': 'SDE.KGPH0828',
                    'type': 'leaf',
                    'text': '控规拼合',
                    'icon': 'img/layer/layermini.png',
                    'data': 'http://106.39.231.23/ArcGIS/rest/services/HZDG/%E6%80%BB%E4%BD%93%E8%A7%84%E5%88%92/MapServer'
                },
                {
                    'id': 'SDE.ZDXM',
                    'type': 'leaf',
                    'text': '重点项目',
                    'icon': 'img/layer/layermini.png',
                    'data': 'http://106.39.231.23/ArcGIS/rest/services/HZDG/%E9%87%8D%E7%82%B9%E9%A1%B9%E7%9B%AE/MapServer'
                }
            ],
        },
        {
            'id': 'id5',
            'type': 'fold',
            'text': '统计',
            'children': [{
                'id': 'id51',
                'type': 'leaf',
                'text': '行政区划人口统计',
                'icon': 'img/layer/layermini.png',
                'data': ''
            }
            ],
        }
    ]
    }
];

function getDemoDataMsg(resultsData) {
    var fieldsDemo = resultsData.msg;
    var tempStrDemo = '';
    var countDemo = fieldsDemo.length;
    for (var i = 0; i < countDemo; i++){
        tempStrDemo = tempStrDemo + fieldsDemo[i].name + ': ' + fieldsDemo[i].value;
        if (i != countDemo-1){
            tempStrDemo = tempStrDemo + '</br>';
        }
    }
    return tempStrDemo;
};

var resultsData = [
    {
        id: '81104000',
        name: '红花湖水库',
        x: '23.074323',
        y: '114.358578',
        msg: [{"name":"水库名称","value":"红花湖水库"},{"name":"所在河流名称","value":"东江"},{"name":"工程规模","value":"中型"},{"name":"总库容(万m³)","value":"1990"},{"name":"坝址控制流域面积(km²)","value":"6.85"},{"name":"主坝尺寸坝高(m)","value":"34.5"},{"name":"调洪库容(万m³)","value":"260"},{"name":"坝址多年平均径流量(万m³)","value":"660"},{"name":"主坝尺寸坝长(m)","value":"179"},{"name":"防洪库容(万m³)","value":"190"},{"name":"高程系统","value":"1956年黄海高程系统"},{"name":"兴利库容(万m³)","value":"600"},{"name":"坝顶高程(m)","value":"58.5"},{"name":"死库容(万m³)","value":"1130"},{"name":"主要挡水建筑物","value":"挡水坝"},{"name":"正常蓄水位相应水面面积(km²)","value":"1.37"},{"name":"挡水主坝类型按材料分","value":"土坝"},{"name":"校核洪水位(m)","value":"57.35"},{"name":"挡水主坝类型按结构分","value":"均质坝"},{"name":"设计洪水位(m)","value":"56.93"},{"name":"主要泄洪建筑物型式","value":"岸坡式"},{"name":"防洪高水位(m)","value":"56.93"},{"name":"正常蓄水位(m)","value":"55.5"},{"name":"防洪限制水位(m)","value":"55.5"},{"name":"死水位(m)","value":"50.5"},{"name":"水库类型","value":"山丘水库"},{"name":"生产安置人口(万人)","value":""},{"name":"建成时间(年)","value":"1994"},{"name":"建成时间(月)","value":"9"},{"name":"水库调节性能","value":"多年调节"},{"name":"工程等别","value":"Ⅲ"},{"name":"最大泄洪流量(m³/s)","value":"14.56"},{"name":"设计洪水标准［重现期］(年)","value":"100"},{"name":"校核洪水标准［重现期］(年)","value":"1000"},{"name":"管理单位名称","value":"惠州市红花湖景区管理处"},{"name":"归口管理部门","value":"其他部门"}]
    },
    // {
    //     id: '12',
    //     name: '名称2',
    //     x: '22.96459401518446',
    //     y: '114.78884548788918',
    //     msg: '测试信息2'
    // },
    // {
    //     id: '13',
    //     name: '名称3',
    //     x: '23.040177376450007',
    //     y: '114.71958857042789',
    //     msg: '测试信息3'
    // },
    // {
    //     id: '14',
    //     name: '名称4',
    //     x: '23.001352462861067',
    //     y: '114.57422115272773',
    //     msg: '测试信息4'
    // },
];
