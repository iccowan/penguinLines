var sortByProperty = function(property)
{
    return function(a,b)
    {
        if(d3.mean(a[property], function(item) { return item.grade; }) ==
           d3.mean(b[property], function(item) { return item.grade; }))
        {
            return 0;
        }
        else if (d3.mean(a[property], function(item) { return item.grade; }) >
           d3.mean(b[property], function(item) { return item.grade; }))
        { 
            return 1;
        }
        else
        {
            return -1;
        }
    }
}

var meanGrade = function(array) {
    return d3.mean(array, function(assignment) { return assignment.grade; });
}

var lineGraph = function(students, width, height) //Final versus mean homework
{
    var screen = {width:width, height:height};
    
    var margins = {top:30, bottom:30, left:70, right:40};
    
    var graph = 
    {
        width:screen.width-margins.left-margins.right,
        height:screen.height-margins.top-margins.bottom,
    }
    
    //set height and width of svg
    var svg = d3.select("#quiz")
            .attr("width", screen.width)
            .attr("height", screen.height);
    
    var g = d3.select("#quiz")
        .append("g")
        .classed("graph", true)
        .attr("transform", "translate("+margins.left+","+
             margins.top+")");
    
    var xScale = d3.scaleLinear()
                .domain([0, students[0].quizes.length - 1])
                .range([0, graph.width])
    
    var yScale = d3.scaleLinear()
                .domain([0, 10])
                .range([graph.height, 0]);
    
    var labels = d3.select("#quiz")
        .append("g")
        .classed("labels", true)
        
    labels.append("text")
        .text("Quiz Grades for All Students")
        .classed("title", true)
        .attr("text-anchor", "middle")
        .attr("x", margins.left+(graph.width/2))
        .attr("y", margins.top / 2)
    
    labels.append("text")
        .text("Quiz")
        .classed("label", true)
        .attr("text-anchor", "middle")
        .attr("x", margins.left+(graph.width/2))
        .attr("y", screen.height -3)
    
    labels.append("g")
        .attr("transform","translate(20,"+ 
              (margins.top+(graph.height/2))+")")
        .append("text")
        .text("Grade")
        .classed("label",true)
        .attr("text-anchor","middle")
        .attr("transform","rotate(-90)");
    
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);
    
    var axes = d3.select("#quiz")
        .append("g")
    axes.append("g")
        .attr("transform","translate("+margins.left+","
             +(screen.height - margins.bottom)+")")
        .call(xAxis)
    axes.append("g")
        .attr("transform","translate("+margins.left+","
             +(margins.top)+")")
        .call(yAxis)
    
    var line = d3.line()
                 .x(function(quiz, index) { return xScale(index); })
                 .y(function(quiz) { return yScale(quiz.grade); })
                 .curve(d3.curveCardinal);
    
    var lines = d3.select("#quiz")
        .select(".graph")
        .selectAll("g")
        .data(students)
        .enter()
        .append("g")
        .classed("line",true)
        .attr("fill","none")
        .attr("stroke","black")
        .attr("stroke-width", "3")
        .attr("transform","translate("+margins.left+","
             +(margins.top)+")")
        .on("mouseover",function(student)
        {
            d3.selectAll(".line")
            .classed("fade",true);
            
            d3.select(this)
                .classed("fade",false)
                .attr("stroke", "blue")
                .raise(); //move to top
            
            d3.select(".extra").selectAll("circle")
                .data(d3.select(this).data()[0].quizes)
                .enter()
                .append("circle")
                .attr("cx", function(quiz, index)
                {
                    return xScale(index) + margins.left;    
                })
                .attr("cy", function(quiz)
                {
                    return yScale(quiz.grade) + margins.top;  
                })
                .attr("r",3)
                .attr("fill","blue")
                .classed("point", true);
            
            d3.select(".extra").selectAll("text")
                .data(d3.select(this).data()[0].quizes)
                .enter()
                .append("text")
                .attr("text-anchor", "middle")
                .attr("x", function(quiz, index)
                {
                    return xScale(index) + margins.left;
                })
                .attr("y", function(quiz)
                {
                    return yScale(quiz.grade) + margins.top + 20;  
                })
                .classed("point-text", true)
                .text(function(quiz) { return quiz.grade; });
            
            // tooltip
            var xPosition = parseFloat(d3.select(this).attr("cx")) + 10;
            var yPosition = parseFloat(d3.select(this).attr("cy")) + 10;
        
            d3.select("#tooltip")
                .style("left", xPosition + "px")
                .style("top", yPosition + "px")
                .select("#pengImg")
                    .attr("src", "imgs/" + student.picture);
        
            d3.select("#tooltip").select("#xdata")
                .text("Mean Quiz: "+Math.round(meanGrade(student.quizes)));
        
            d3.select("#tooltip #finalScore")
                .text("Final Score: " + student.final[0].grade);
        
            d3.select("#tooltip #avgHW")
                .text("HW Average: " + Math.round(meanGrade(student.homework)));
        
            d3.select("#tooltip #avgQuiz")
                .text("Quiz Average: " + Math.round(meanGrade(student.quizes)));
        
            d3.select("#tooltip #avgTest")
                .text("Test Average: " + Math.round(meanGrade(student.test)));
        
            d3.select("#tooltip").classed("hidden", false);
        })
        .on("mouseout",function(student)
           {
            d3.selectAll(".line")
                .classed("fade",false)
                .attr("stroke", "black");
            d3.selectAll(".point").remove();
            d3.selectAll(".point-text").remove();
            
            // tooltip
            d3.select("#tooltip").classed("hidden", true);
        });
    
    lines.append("path")
        .datum(function(student) { return student.quizes;} )
        .attr("d", line);
}

var showScatter = function () {
    d3.selectAll("btn.plot").on("click", function() {
        d3.selectAll("btn.plot").classed("active", false);
        d3.select(this).classed("active", true);
        
        d3.selectAll(".plotDiv")
          .classed("hidden", true);
        
        var ref = d3.select(this).attr("id-ref");
        d3.select(ref).classed("hidden", false);
    })
}

// Get the penguin information
var penguinPromise = d3.json("https://iccowan.github.io/penguinLines/classData.json");
penguinPromise.then(function(students) {
    var width = 1600;
    var height= 500;
    
    lineGraph(students,width,height);
    
    showScatter();
    
}, function(err) {
    console.log("failed to get student data:", err);
});