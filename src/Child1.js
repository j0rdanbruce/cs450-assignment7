import React, { Component } from 'react';
import * as d3 from 'd3';

class Child1 extends Component {
  constructor(){
    super();
    this.state = {
      subject: 'Sentiment',
      comments: []
    }
  }

  componentDidMount(){
    //var data = this.props.data;
    //console.log(data)
    //console.log(this.state.subject)
    this.renderForceLayout();
    this.renderComments();
  }

  componentDidUpdate(){
    //var data = this.props.data;
    //console.log(data)
    //console.log(this.state.subject)
    this.renderForceLayout();
    this.renderComments();
  }

  //function for handling dorp down button for month selection
  handleDropdownClick = (event) => {
    //event.preventDefault()
    console.log(event.target.value)
    this.setState({
      ...this.state,
      subject: event.target.value
    })
  }

  renderForceLayout = () => {
    var self = this;
    var data = this.props.data.slice(0,300);

    const margin = { top: 20, right: 90, bottom: 50, left: 300 },
      width = 1200 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    var container  = d3.select('.svg_parent')
      .attr('width', width+margin.left+margin.right)
      .attr('height', height+margin.top+margin.bottom)
    
    var sentimentColorScale = d3.scaleLinear().domain([-1, 0, 1]).range(["red", "#ECECEC", "green"]);
    var subjectivityColorScale = d3.scaleLinear().domain([0,1]).range(["#ECECEC","#4467C4"]);
    var colorScale = this.state.subject === 'Sentiment' ? sentimentColorScale : subjectivityColorScale;
    var months = ['March','April','May']
    var x_range = d3.extent(data, d=>d.x)
    //console.log(x_range)
    var catCenters = [100, 250, 400];
    var categoryScale = d3.scaleOrdinal().domain(months).range(catCenters)
    var xScale = d3.scaleLinear().domain(x_range).range([margin.left, width])

    //Creating the forcelayout visual
    d3.forceSimulation(data)
      .force('y',d3.forceY((d)=>categoryScale(d.Month)))
      //.force('x',d3.forceX(width/2))
      .force('collision', d3.forceCollide(7))
      .on('tick',()=>{
        container.select('g').selectAll('circle').data(data).join('circle')
          .attr('cx', d=>xScale(d.x))
          .attr('cy', d=>d.y)
          .attr('r',d=>7)
          .attr('fill', d=>colorScale(d[this.state.subject]))
          .on('click', function(e,d){
            var tweet = d.RawTweet
            var comments = self.state.comments;
            var nextColor = this.style.stroke == 'black' ? 'none' : 'black'

            console.log(d)
            //handling the addition or removal of comments when selecting and unselecting a circle
            if (this.style.stroke == 'black' && comments.includes(tweet)){
              self.setState({
                ...self.state,
                comments: comments.filter(comment => comment != tweet)
              })
            } else {
              self.setState({
                ...self.state,
                comments: [
                  ...self.state.comments,
                  tweet
                ]
              })
            }
            d3.select(this).style('stroke',nextColor).style('stroke-width',1.5)
          })
      })
    
    //Setting the legend for the force layout visual
    const stops = this.state.subject === 'Sentiment'
      ? [
          { offset: "0%", color: "green" },
          { offset: "50%", color: "#ECECEC" },
          { offset: "100%", color: "red" }
        ] 
      : [
          { offset: "0%", color: "#4467C4" },
          { offset: "100%", color: "#ECECEC" }
        ];
    var linearGradient = container.selectAll('defs').data([null]).join('defs')
      .selectAll('linearGradient').data([null]).join('linearGradient')
      .attr("id", "color-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    
    if (data.length > 0) {
      // Use join to create the gradient stops
      linearGradient.selectAll("stop")
        .data(stops)
        .join("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

      container.selectAll('rect').data([null]).join('rect')
        .attr('x',width+margin.left/2)
        .attr('y',margin.top)
        .attr('width',margin.bottom/2)
        .attr('height',height - margin.top - margin.bottom)
        .style('fill', 'url(#color-gradient)')
    }

    //month labels
    if (data.length > 0) {
      container.selectAll('text').data(months).join('text')
        .attr('x', margin.top/2)
        .attr('y', d=>categoryScale(d))
        .text(d=>d)
    }

    if (data.length > 0) {
      // top label
      container.selectAll('text.legend-top').data([null]).join('text')
        .attr('class', 'legend-top')
        .attr('x', width+margin.left/2+margin.bottom)
        .attr('y', margin.top+10)
        .attr('text-anchor', 'start')
        .style('font-size', '12px')
        .style('fill', '#000')
        .text(this.state.subject === 'Sentiment' ? 'Positive' : 'Subjective');
      // bottom label
      container.selectAll('text.legend-bottom').data([null]).join('text')
        .attr('class', 'legend-bottom')
        .attr('x', width+margin.left/2+margin.bottom)
        .attr('y', height-margin.top-margin.bottom+10)
        .attr('text-anchor', 'start')
        .style('font-size', '12px')
        .style('fill', '#000')
        .text(this.state.subject === 'Sentiment' ? 'Negative' : 'Objective');
    }

  }

  // handleCircleClick(data){
  //   var tweet = d.RawTweet
  //   var comments = self.state.comments;
  //   var nextColor = this.style.stroke == 'black' ? 'none' : 'black'

  //   //console.log(this)
  //   //handling the addition or removal of comments when selecting and unselecting a circle
  //   if (this.style.stroke == 'black' && comments.includes(tweet)){
  //     self.setState({
  //       comments: comments.filter(comment => comment != tweet)
  //     })
  //   } else {
  //     self.setState({
  //       comments: [
  //         ...self.state.comments,
  //         tweet
  //       ]
  //     })
  //   }
  //   d3.select(this).style('stroke',nextColor)
  // }

  

  renderComments = () => {
    var comments = this.state.comments;

    d3.select('.comments').select('g').selectAll('p').data(comments).join('p')
      .text(d=>d)
  }

  render(){
    //JSX dropdown interface for months selection
    var dropDownBtn = (
      <div>
        <label for='subjects'>Color By:</label>
        <select name="subjects" id="subjects" onChange={this.handleDropdownClick}>
          <option id={1} value={'Sentiment'} selected={'Sentiment' == this.state.subject}>Sentiment</option>
          <option id={2} value={'Subjectivity'} selected={'Subjectivity' == this.state.subject}>Subjectivity</option>
        </select>
      </div>
    )

    return(
      <div className='child1'>
        {dropDownBtn}
        <svg className='svg_parent'><g></g></svg>
        <div className='comments'><g></g></div>
      </div>
    );
  }
}

export default Child1;