

onRouteMarkersSet = function (pois)
{
    var start = pois[0].marker, end = pois[1].marker;
    start.enableDragging();//开启起点拖拽功能
    end.enableDragging();//开启终点拖拽功能
    start.addEventListener("dragend",
                           function(e)
                           {
                           //map.clearOverlays();
                           //driving.search(e.point,end.getPosition());
                           sampleSt = e.point;
                           }
                           );
    end.addEventListener("dragend",function(e){
                         //map.clearOverlays();
                         //driving.search(start.getPosition(),e.point);
                         sampleEd = e.point;
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
            //s.push(points[i].lng+","+points[i].lat);
            s.push(points[i].lng.toFixed(6)+","+points[i].lat.toFixed(6));

        }

        document.getElementById("routedata").innerHTML = s.join("<br/>");
    }
}



