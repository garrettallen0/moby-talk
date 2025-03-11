import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphData, Node, Link } from '../types/graph';

interface ForceGraphProps {
  data: GraphData;
  width: number;
  height: number;
}

const ForceGraph = ({ data, width, height }: ForceGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);

    // Create force simulation
    const simulation = d3.forceSimulation<Node>(data.nodes)
      .force("link", d3.forceLink<Node, Link>(data.links)
        .id((d) => d.id)
        .distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Create links
    const links = svg.append("g")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .style("stroke", "#999")
      .style("stroke-opacity", 0.6)
      .style("stroke-width", 1);

    // Create nodes
    const nodes = svg.append("g")
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("r", d => Math.max(10, 5 + d.connections * 2))
      .style("fill", "#69b3a2")
      .style("stroke", "#fff")
      .style("stroke-width", 1.5)
      .call(d3.drag<SVGCircleElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Add chapter labels
    const labels = svg.append("g")
      .selectAll("text")
      .data(data.nodes)
      .enter()
      .append("text")
      .text(d => d.chapter.toString())
      .style("text-anchor", "middle")
      .style("dominant-baseline", "central")
      .style("font-size", "10px")
      .style("fill", "white");

    // Update positions on simulation tick
    simulation.on("tick", () => {
      links
        .attr("x1", d => (d.source as Node).x!)
        .attr("y1", d => (d.source as Node).y!)
        .attr("x2", d => (d.target as Node).x!)
        .attr("y2", d => (d.target as Node).y!);

      nodes
        .attr("cx", d => d.x!)
        .attr("cy", d => d.y!);

      labels
        .attr("x", d => d.x!)
        .attr("y", d => d.y!);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, width, height]);

  return (
    <svg ref={svgRef} width={width} height={height} />
  );
};

export default ForceGraph; 