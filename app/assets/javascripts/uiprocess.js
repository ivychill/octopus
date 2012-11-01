

ShowAll = function ()
{
    map.clearOverlays();
    //luArray = readLocationUpdateData(this.result);
    //var btsCount = luArray.length;
    for (var i=0; i<luArray.length; i++)
    {
        
        for (var j=0; j<btsArray.length;j++)
        {
            
            if (luArray[i].cellid == btsArray[j].cellid)
            {
                var btspoint = new BMap.Point(btsArray[j].lng, btsArray[j].lat);
                var btscircle = new BMap.Circle(btspoint,btsArray[j].raid*1000);
                btscircle.setFillOpacity(0.2);
                map.addOverlay(btscircle);
                
                //var point = new BMap.Point(116.404, 39.915);
                var marker = new BMap.Marker(btspoint);  // 创建标注
                map.addOverlay(marker);              // 将标注添加到地图中
                
                var label = new BMap.Label(i);//+":"+luArray[i].cellid,{offset:new BMap.Size(-40,-20)});
                marker.setLabel(label);
                
            }
        }
    }
    
    
}

StepNext = function ()
{
    map.clearOverlays();
    
    if (steIndex >= luArray.length)
    {
        steIndex = 0;
    }
    
    
    for (var j=0; j<btsArray.length;j++)
    {
        
        if (luArray[steIndex].cellid == btsArray[j].cellid)
        {
            var btspoint = new BMap.Point(btsArray[j].lng, btsArray[j].lat);
            var btscircle = new BMap.Circle(btspoint,btsArray[j].raid*1000);
            btscircle.setFillOpacity(0.2);
            map.addOverlay(btscircle);
            
            //var point = new BMap.Point(116.404, 39.915);
            var marker = new BMap.Marker(btspoint);  // 创建标注
            map.addOverlay(marker);              // 将标注添加到地图中
            
            var label = new BMap.Label(steIndex+":"+luArray[steIndex].cellid,{offset:new BMap.Size(-40,-20)});
            marker.setLabel(label);
            
        }
    }
    
    steIndex++;
    
}

StepPre = function ()
{
    map.clearOverlays();
    
    steIndex--;
    if (steIndex <= 0)
    {
        steIndex = luArray.length - 1;
    }
    else
    {
        steIndex--;
    }
    
    
    for (var j=0; j<btsArray.length;j++)
    {
        
        if (luArray[steIndex].cellid == btsArray[j].cellid)
        {
            var btspoint = new BMap.Point(btsArray[j].lng, btsArray[j].lat);
            var btscircle = new BMap.Circle(btspoint,btsArray[j].raid*1000);
            btscircle.setFillOpacity(0.2);
            map.addOverlay(btscircle);
            
            //var point = new BMap.Point(116.404, 39.915);
            var marker = new BMap.Marker(btspoint);  // 创建标注
            map.addOverlay(marker);              // 将标注添加到地图中
            
            var label = new BMap.Label(steIndex+":"+luArray[steIndex].cellid,{offset:new BMap.Size(-40,-20)});
            marker.setLabel(label);
            
        }
    }
    
    steIndex++;
}

function NextSegment()
{
    map.clearOverlays();
    segPntIndex = 0;

    
    if (segIndex >= gSegmentArray.length)
    {
        segIndex = 0;
    }
    
    var pointArray = gSegmentArray[segIndex];
    
    document.getElementById("Output").innerHTML = "";//"<br/>处理路名:"+thisName;
    
    for (var j=0; j<pointArray.length;j++)
    {
        
        var btspoint = new BMap.Point(pointArray[j].lng, pointArray[j].lat);
        var btscircle = new BMap.Circle(btspoint,pointArray[j].raid*1000);
        btscircle.setFillOpacity(0.2);
        map.addOverlay(btscircle);
        
        //var point = new BMap.Point(116.404, 39.915);
        var marker = new BMap.Marker(btspoint);  // 创建标注
        map.addOverlay(marker);              // 将标注添加到地图中
        
        var label = new BMap.Label(j+":"+pointArray[j].cellid,{offset:new BMap.Size(-40,-20)});
        marker.setLabel(label);
        document.getElementById("Output").innerHTML += "<br/>"+j+":"+pointArray[j].cellid;
        for (var ni=0; ni<pointArray[j].roadNames.length; ni++)
        {
            document.getElementById("Output").innerHTML += "<br/>"+pointArray[j].roadNames[ni];
        }
        
        
    }
    
    segIndex++;
    
    
}


function matchRoad()
{
    map.clearOverlays();
    
    //    for (var i=0; i < gSegmentArray.length; i++)
    //    {
    //        var pointArray = gSegmentArray[i];
    //        for (var j=0; j<pointArray.length;j++)
    //        {
    //
    //            var btspoint = new BMap.Point(pointArray[j].lng, pointArray[j].lat);
    //        }
    //    }
    
    var matchIndex = 0;
    
    matchIndex = segIndex - 1;
    
    if (matchIndex < 0)
    {
        matchIndex = gSegmentArray.length - 1;
    }
    
    if (matchIndex >= gSegmentArray.length)
    {
        matchIndex = 0;
    }
    
    
    
    var pointArray = gSegmentArray[matchIndex];
    
    var pCnt = pointArray.length;
    if (pCnt > 1)
    {
        
        var P1 = new BMap.Point(pointArray[0].lng, pointArray[0].lat);
        var P2 = new BMap.Point(pointArray[pointArray.length-1].lng, pointArray[pointArray.length-1].lat);
        
        var PointListIndex = 99;
        if (pointArray[0].roadNames[0] == "环城高速东侧北向")
        {
            PointListIndex = 0;
        }
        if (pointArray[0].roadNames[0] == "环城高速北侧北向")
        {
            PointListIndex = 1;
        }
        if (pointArray[0].roadNames[0] == "成渝高速东向")
        {
            PointListIndex = 2;
        }
        if (pointArray[0].roadNames[0] == "机场高速北向")
        {
            PointListIndex = 3;
        }
        
        if (PointListIndex < 4)
        {
            var poinlist = gPathArray[PointListIndex];
            var retDistInfo1 = getNearestDistanceOfRoad(P1, poinlist);
            var retDistInfo2 = getNearestDistanceOfRoad(P2, poinlist);
        }
        
        var drivingOptions = {
        renderOptions: {map: map, panel: "results"},
            //onMarkersSet: onRouteMarkersSet,
        onSearchComplete: onDrivingSearchComplete,
        };
        var driving = new BMap.DrivingRoute(map, drivingOptions);
        var startPoint = retDistInfo1.projection;// new BMap.Point(106.598575,29.395151);
        var endPoint = retDistInfo2.projection;//new BMap.Point(106.446509,29.518006);
        driving.search(startPoint,endPoint);
        
        
    }
    
    
    
}

function NextSegPoint()
{
    map.clearOverlays();
    
    var matchIndex = 0;
    
    matchIndex = segIndex - 1;
    
    if (matchIndex < 0)
    {
        matchIndex = gSegmentArray.length - 1;
    }
    
    if (matchIndex >= gSegmentArray.length)
    {
        matchIndex = 0;
    }
    
    var pointArray = gSegmentArray[matchIndex];
    
    
    if (segPntIndex >= pointArray.length)
    {
        segPntIndex = 0;
    }
    
    
    document.getElementById("Output").innerHTML = "";//"<br/>处理路名:"+thisName;
    
    var btspoint = new BMap.Point(pointArray[segPntIndex].lng, pointArray[segPntIndex].lat);
    var btscircle = new BMap.Circle(btspoint,pointArray[segPntIndex].raid*1000);
    btscircle.setFillOpacity(0.2);
    map.addOverlay(btscircle);
    
    //var point = new BMap.Point(116.404, 39.915);
    var marker = new BMap.Marker(btspoint);  // 创建标注
    map.addOverlay(marker);              // 将标注添加到地图中
    
    var label = new BMap.Label(segPntIndex+":"+pointArray[segPntIndex].cellid,{offset:new BMap.Size(-40,-20)});
    marker.setLabel(label);
    
    document.getElementById("Output").innerHTML = "<br/>"+pointArray[segPntIndex].cellid+":"+pointArray[segPntIndex].roadIndex[0];

    
    
    segPntIndex++;
    
    
}


function TestFunction(index)
{
    
//    var ttbts = new BTSSite(11,22,4,"cellliddd");
//    
//    var newt = ttbts.Clone();
//    
//    newt.cellid = "DDDDD";
//    ttbts.lng = 111.111;
//    
//    document.getElementById("Output").innerHTML = "";//"道路名" + j + ";";
//    document.getElementById("Output").innerHTML += "</br>Old="+ttbts.cellid;
//    document.getElementById("Output").innerHTML += "</br>new="+newt.cellid;
//    document.getElementById("Output").innerHTML += "</br>new="+newt.raid;
//    document.getElementById("Output").innerHTML += "</br>new="+newt.lng;

    //
    var i =2;
    
    var ouHtml = new String();
    
    document.getElementById("RouteList").innerHTML = "";

    document.getElementById("RouteList").innerHTML += "<tr><td  onclick=\"TestAction("+1+")\"> 可能路线"+i+"，经过路段:";
    for (var j=0; j<2; j++)
    {
        
        document.getElementById("RouteList").innerHTML += "道路名" + j + ";";
        
    }
    document.getElementById("RouteList").innerHTML += " </td></tr>";

    
}

function TestAction(index)
{
    
    var point = new BMap.Point(104.545702,29.528792);       // 创建点坐标
    map.centerAndZoom(point,12);                            // 初始化地图,设置中心点坐标和地图级别。
    document.getElementById("Output").innerHTML += "AAAAAAAA"+index;//"</br><p   onclick=\"TestAction()\"> 可能路线--》点击我 </p>"

}


function DisplayRoute(index)
{
    
    var segmentList = gRoutesArray[index];
    segCnt = segmentList.length;
    
    map.clearOverlays();
    segIndex = 0;
    segPntIndex = 0;
    routeIndex = index;

    for (var i = 0; i<segCnt; i++)
    {
        var pointArray = segmentList[i];
        
        
        for (var j=0; j<pointArray.length;j++)
        {
            
            var btspoint = new BMap.Point(pointArray[j].lng, pointArray[j].lat);
            var btscircle = new BMap.Circle(btspoint,pointArray[j].raid*1000);
            btscircle.setFillOpacity(0.2);
            map.addOverlay(btscircle);
            
            //var point = new BMap.Point(116.404, 39.915);
            var marker = new BMap.Marker(btspoint);  // 创建标注
            map.addOverlay(marker);              // 将标注添加到地图中
            
            var label = new BMap.Label(j+":"+pointArray[j].cellid,{offset:new BMap.Size(-40,-20)});
            marker.setLabel(label);            
            
        }
    }

}


function RouteNextSegment()
{
    map.clearOverlays();
    segPntIndex = 0;
    
    var segmentList = gRoutesArray[routeIndex];
    
    if (segIndex >= segmentList.length)
    {
        segIndex = 0;
    }
    
    var pointArray = segmentList[segIndex];
    
    document.getElementById("Output").innerHTML = "";//"<br/>处理路名:"+thisName;
    
    for (var j=0; j<pointArray.length;j++)
    {
        
        var btspoint = new BMap.Point(pointArray[j].lng, pointArray[j].lat);
        var btscircle = new BMap.Circle(btspoint,pointArray[j].raid*1000);
        btscircle.setFillOpacity(0.2);
        map.addOverlay(btscircle);
        
        //var point = new BMap.Point(116.404, 39.915);
        var marker = new BMap.Marker(btspoint);  // 创建标注
        map.addOverlay(marker);              // 将标注添加到地图中
        
        var label = new BMap.Label(j+":"+pointArray[j].cellid,{offset:new BMap.Size(-40,-20)});
        marker.setLabel(label);
        document.getElementById("Output").innerHTML += "<br/>"+j+":"+pointArray[j].cellid;
        for (var ni=0; ni<pointArray[j].roadNames.length; ni++)
        {
            document.getElementById("Output").innerHTML += "<br/>"+pointArray[j].roadNames[ni];
        }
        
        
    }
    
    segIndex++;
    
    
}

function RouteNextSegPoint()
{
    map.clearOverlays();
    
    var segmentList = gRoutesArray[routeIndex];

    
    var matchIndex = 0;
    
    matchIndex = segIndex - 1;
    
    if (matchIndex < 0)
    {
        matchIndex = segmentList.length - 1;
    }
    
    if (matchIndex >= segmentList.length)
    {
        matchIndex = 0;
    }
    
    var pointArray = segmentList[matchIndex];

    
    if (segPntIndex >= pointArray.length)
    {
        segPntIndex = 0;
    }
    
    
    document.getElementById("Output").innerHTML = "";//"<br/>处理路名:"+thisName;
    
    var btspoint = new BMap.Point(pointArray[segPntIndex].lng, pointArray[segPntIndex].lat);
    var btscircle = new BMap.Circle(btspoint,pointArray[segPntIndex].raid*1000);
    btscircle.setFillOpacity(0.2);
    map.addOverlay(btscircle);
    
    //var point = new BMap.Point(116.404, 39.915);
    var marker = new BMap.Marker(btspoint);  // 创建标注
    map.addOverlay(marker);              // 将标注添加到地图中
    
    var label = new BMap.Label(segPntIndex+":"+pointArray[segPntIndex].cellid,{offset:new BMap.Size(-40,-20)});
    marker.setLabel(label);
    
    document.getElementById("Output").innerHTML = "<br/>"+pointArray[segPntIndex].cellid+":"+pointArray[segPntIndex].roadIndex[0];
    
    
    
    segPntIndex++;
    
    
}



//Example
//function Car(color,doors)
//{
//    this.color=color;
//    this.doors=doors;
//    this.drivers=new Array("Tom","Jerry");
//    this.showColor = function() {
//        return this.color;
//    }
//}
//
//function testvvt()
//{
//    alert( "dkdkdk");
//}


