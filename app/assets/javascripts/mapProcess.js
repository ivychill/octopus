

onRouteMarkersSet = function (pois)
{
    var start = pois[0].marker, end = pois[1].marker;
    start.enableDragging();//开启起点拖拽功能
    end.enableDragging();//开启终点拖拽功能
    start.addEventListener("dragend",
                           function(e)
                           {
                           map.clearOverlays();
                           driving.search(e.point,end.getPosition());
                           }
                           );
    end.addEventListener("dragend",function(e){
                         map.clearOverlays();
                         driving.search(start.getPosition(),e.point);
                         });
}



onDrivingSearchComplete =  function(results)
{
    if (driving.getStatus() == BMAP_STATUS_SUCCESS)
    {
        // 获取第一条方案
        var plan = results.getPlan(0);
        
        // 获取方案的驾车线路
        var route = plan.getRoute(0);
        
        // 获取每个关键步骤,并输出到页面
        var s = [];
        var points = route.getPath();
        for (var i = 0; i < points.length; i ++)
        {
            s.push(points[i].lng+","+points[i].lat);
        }

        document.getElementById("routedata").innerHTML = s.join("<br/>");
    }
}


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
    
    if (segIndex >= gSegmentArray.length)
    {
        segIndex = 0;
    }
    
    var pointArray = gSegmentArray[segIndex];
    
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
    
    segIndex++;
    
    
}

