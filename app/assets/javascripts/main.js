//全局变量    
    var btsArray =  new Array();
    var luArray =  new Array();
    var gSegmentArray = new Array();
    var gPathArray = new Array();
    var gRoutesArray = new Array();
    var gSegTrust = new Array();
    
    var steIndex =  0;
    var segIndex = 0;
    var segPntIndex = 0;
    var routeIndex = 0;
        var gTempSegmentArray = new Array();
    var gPotentialPathLinks = new Array();//PathLinks;
    var gPathTraffic = new Array();
    
    var sampleSt;
    var sampleEd;
    var map;
    
function main() {
    //初始化百度地图
    map = new BMap.Map("mapcontainer");                    // 创建Map实例
    var point = new BMap.Point(106.545702,29.528792);       // 创建点坐标
    map.centerAndZoom(point,12);                            // 初始化地图,设置中心点坐标和地图级别。
    map.addControl(new BMap.NavigationControl());           // 缩放控件
    
    
    //初始化读取文件的判断和回调设置等
    // 检测不同的File API支持度
    if (window.File && window.FileReader && window.FileList && window.Blob)
    {
        // 支持所有的File API
        document.getElementById('BTSFiles').addEventListener('change', handleBTSFileSelect, false);
        document.getElementById('LUFiles').addEventListener('change', handleLUFileSelect, false);
        document.getElementById('PATHFiles').addEventListener('change', handlePathFileSelect, false);
        
        document.getElementById('MultiLUFiles').addEventListener('change', handleMultiLUFileSelect, false);

    }
    else
    {
        alert('The File APIs are not fully supported in this browser.');
    }
    
    
    //规划路径获取路线信息
    var drivingOptions = {
        renderOptions: {map: map, panel: "results"},
        onMarkersSet: onRouteMarkersSet,
        onSearchComplete: onDrivingSearchComplete,
    };
    var driving = new BMap.DrivingRoute(map, drivingOptions);
    var startPoint = new BMap.Point(106.598575,29.395151);
    var endPoint = new BMap.Point(106.446509,29.518006);
    //driving.search(startPoint,endPoint);
    
    
    alert("JS装入完毕");
}
