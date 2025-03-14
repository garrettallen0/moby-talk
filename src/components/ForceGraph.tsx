import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphData, Node, Link } from '../types/graph';

interface ForceGraphProps {
  data: GraphData;
  width?: number;
  height?: number;
  miniature?: boolean;
}

const ForceGraph = ({ data, width = 800, height = 600, miniature = false }: ForceGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    // Clear existing content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    
    // Create the simulation with appropriate forces
    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links)
        .id((d: any) => d.id)
        .distance(miniature ? 30 : 100))
      .force("charge", d3.forceManyBody().strength(miniature ? -100 : -300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Add zoom behavior if not in miniature mode
    if (!miniature) {
      const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
          container.attr("transform", event.transform);
        });
      svg.call(zoom as any);
    }

    const container = svg.append("g");

    // Create the links
    const links = container
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", miniature ? 1 : 2);

    // Create the nodes
    const nodes = container
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", (d: any) => miniature ? 4 + Math.min(d.connections, 3) : 8 + Math.min(d.connections * 2, 8))
      .attr("fill", "#69b3a2")
      .attr("stroke", "#fff")
      .attr("stroke-width", miniature ? 1 : 2);

    if (!miniature) {
      nodes.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);
    }

    // Add chapter numbers if not in miniature mode
    if (!miniature) {
      container
        .selectAll("text")
        .data(data.nodes)
        .join("text")
        .text((d: any) => d.chapter)
        .attr("font-size", "12px")
        .attr("dx", 12)
        .attr("dy", 4);
    }

    simulation.on("tick", () => {
      links
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodes
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      if (!miniature) {
        container
          .selectAll("text")
          .attr("x", (d: any) => d.x)
          .attr("y", (d: any) => d.y);
      }
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, width, height, miniature]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ background: miniature ? 'transparent' : '#f8f9fa' }}
    />
  );
};

export default ForceGraph; 