import * as d3 from 'd3';
import { GraphData } from '../types/graph';
import { useEffect, useRef } from 'react';

interface ForceGraphProps {
  data: GraphData;
  width: number;
  height: number;
  miniature?: boolean;
}

export const ForceGraph = ({ data, width, height, miniature = false }: ForceGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear existing content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    
    // Set up the SVG with proper viewBox and transform
    svg
      .attr("viewBox", [0, 0, width, height])
      .attr("preserveAspectRatio", "xMidYMid meet");
    
    const container = svg.append("g");

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        container.attr("transform", event.transform.toString());
      });

    svg.call(zoom);

    // Create force simulation with adjusted parameters for better containment
    const simulation = d3.forceSimulation(data.nodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(data.links)
        .id((d: any) => d.id)
        .distance(miniature ? 35 : 45))
      .force("charge", d3.forceManyBody()
        .strength(miniature ? -80 : -200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide()
        .radius(12));

    // Initialize node positions in a circle
    const radius = Math.min(width, height) / 3;
    data.nodes.forEach((node: any, i: number) => {
      const angle = (i / data.nodes.length) * 2 * Math.PI;
      node.x = width / 2 + radius * Math.cos(angle);
      node.y = height / 2 + radius * Math.sin(angle);
    });

    // Draw links
    const links = container
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6);

    // Draw nodes
    const nodes = container
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("fill", "#69b3a2");

    // Add node labels
    const labels = container
      .selectAll("text")
      .data(data.nodes)
      .enter()
      .append("text")
      .text((d: any) => d.chapter)
      .attr("font-size", "10px")
      .attr("dx", 8)
      .attr("dy", 3);

    // Update positions on each tick
    simulation.on("tick", () => {
      links
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodes
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, width, height, miniature]);

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default ForceGraph; 