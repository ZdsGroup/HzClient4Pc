/**
 * Created by zhao on 2016/12/10.
 */

var myMap = null;
var myLayers = [];
var myQueryLayerGroup = new L.layerGroup();

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
        // var results = resultsData;
        L.esri.Support.cors = false;
        var queryEnable = false;
        for (var i = 0; i < layerIds.length; i++){
            if(layerIds[i].indexOf('SDE') < 0){
                continue;
            }
            queryEnable = true;
            var queryUrl = stringFormat(queryUrlTemplate, userkey, layerIds[i]);
            L.esri.query({
                url: queryUrl
            }).where('OBJECTID<20').run(function (errMsg, queryResults, response) {
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
        myQueryLayerGroup = new L.layerGroup();
        var queryR = L.geoJSON(results, {
            // pointToLayer: function (geoJsonPoint, latlng) {
            //     //config here if has point feature
            // },
            style: function (feature) {
                return {color: '#291eed'};
            },
            onEachFeature: function (jsonfeature, layer) {
                layer.on('click', function (e) {
                    var name = 'OBJECTID: ' + e.target.feature.properties.OBJECTID;
                    var msg = 'OBJECTID: ' + e.target.feature.properties.OBJECTID + '</br>' +
                        'SHAPE_LENG: ' + e.target.feature.properties.SHAPE_LENG;
                    myQueryLayerGroup.clearLayers();
                    var mark = new L.marker(e.latlng).bindPopup(msg).bindTooltip(name, {className: 'query-marker-tooltip'});
                    var selObj = L.geoJSON(e.target.feature, { style: function (feature) {
                            return {color: 'red'};
                        },});
                    myQueryLayerGroup.addLayer(selObj);
                    myQueryLayerGroup.addLayer(mark);
                    mark.openPopup();
                    myMap.fitBounds(e.target._bounds);
                })
            }
        });
        myMap.addLayer(queryR);
        myMap.fitBounds(queryR.getBounds());
        myMap.addLayer(myQueryLayerGroup);
    }
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
        myMap.addLayer(restlayer);
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
// var layerData1 = [
//     {   'id': 'root',
//         'type': 'fold',
//         'text': '服务目录', 'children': [
//         {
//             'id': 'id1',
//             'type': 'fold',
//             'text': '基础服务',
//             'children': [{
//                 'id': 'id11',
//                 'type': 'leaf',
//                 'text': '惠城区行政区划',
//                 'icon': 'img/layer/layermini.png',
//                 'data': 'http://106.39.231.23/ArcGIS/rest/services/HZDG/%E6%83%A0%E5%9F%8E%E5%8C%BA%E8%A1%8C%E6%94%BF%E5%8C%BA%E5%88%92/MapServer'
//             }],
//         },
//         {
//             'id': 'id2',
//             'type': 'fold',
//             'text': '水务专题服务',
//             'children': [{
//                 'id': 'id21',
//                 'type': 'leaf',
//                 'text': '水源保护区',
//                 'icon': 'img/layer/layermini.png',
//                 'data': 'http://106.39.231.23/ArcGIS/rest/services/HZDG/%E6%B0%B4%E6%BA%90%E4%BF%9D%E6%8A%A4%E5%8C%BA/MapServer'
//             }],
//         },
//     ]
//     }
// ];

var layerData = [
    {   'id': 'root',
        'type': 'fold',
        'text': '专题应用服务', 'children': [
        {
            'id': 'id1',
            'type': 'fold',
            'text': '环保',
            'children': [{
                    'id': 'id11',
                    'type': 'leaf',
                    'text': '水源保护区',
                    'icon': 'img/layer/layermini.png',
                    'data': 'http://106.39.231.23/ArcGIS/rest/services/HZDG/%E6%B0%B4%E6%BA%90%E4%BF%9D%E6%8A%A4%E5%8C%BA/MapServer'
                },
                {
                    'id': 'id12',
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
                }
            ],
        },
        {
            'id': 'id3',
            'type': 'fold',
            'text': '交通',
            'children': [{
                    'id': 'id31',
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
                    'id': 'id42',
                    'type': 'leaf',
                    'text': '城市总体规划',
                    'icon': 'img/layer/layermini.png',
                    'data': 'http://106.39.231.23/ArcGIS/rest/services/HZDG/%E6%80%BB%E4%BD%93%E8%A7%84%E5%88%92/MapServer'
                },
                {
                    'id': 'id43',
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

var resultsData = [
    {
        id: '11',
        name: '名称1',
        x: '22.908465647514895',
        y: '114.65441977583869',
        msg: '测试信息1'
    },
    {
        id: '12',
        name: '名称2',
        x: '22.96459401518446',
        y: '114.78884548788918',
        msg: '测试信息2'
    },
    {
        id: '13',
        name: '名称3',
        x: '23.040177376450007',
        y: '114.71958857042789',
        msg: '测试信息3'
    },
    {
        id: '14',
        name: '名称4',
        x: '23.001352462861067',
        y: '114.57422115272773',
        msg: '测试信息4'
    },
];
