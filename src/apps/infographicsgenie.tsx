"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { json } from "stream/consumers";

type TwoColumnGridProps = {
  col1: React.ReactNode;
  col2: React.ReactNode;
};
const TwoColumnGrid = (props: TwoColumnGridProps) => {
  return (
    <div className="grid rounded-xl grid-cols-2 gap-1 p-4">
      <div className="bg-gray-700 p-4">{props.col1}</div>
      <div className="bg-blue-700 p-4">{props.col2}</div>
    </div>
  );
};

const InfographicGenerator = () => {
  const [jsonData, setJsonData] = useState({});
  const [template, setTemplate] = useState("");
  const [infographic, setInfographic] = useState("");

  const [bgColor, setBgColor] = useState("#fefefe");

  const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files?.[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setJsonData(json);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file as Blob);
  };

  const handleTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const template_file = e.target?.result as string;
      setTemplate(template_file);
    };
    reader.readAsText(file as Blob);
  };

  const generateInfographic = () => {
    if (!jsonData || !template) {
      alert("Please upload both JSON data and template");
      return;
    }

    // This is a simplified example. In a real implementation,
    // you'd process the template and JSON to create the infographic.
    let svg = template;
    Object.entries(jsonData || {}).map(([key, value], index) => {
      const title_key = `{{${key}}}`;
      svg = svg.replace(title_key, value as string);
    });

    setInfographic(svg);
  };

  const handleDownload = () => {
    if (!infographic) {
      alert("Please generate an infographic first");
      return;
    }

    const blob = new Blob([infographic], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "infographic.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Infographic Generator</h1>
      <div className="space-y-4">
        <Card>
          <CardHeader>Upload Files</CardHeader>
          <CardContent>
            <TwoColumnGrid
              col1={
                <>
                  <Label htmlFor="json-upload">Upload JSON Data</Label>
                  <Input
                    id="json-upload"
                    type="file"
                    onChange={handleJsonUpload}
                    accept=".json"
                  />
                </>
              }
              col2={
                <>
                  <Label htmlFor="template-upload" className="mt-2">
                    Upload Template
                  </Label>
                  <Input
                    id="template-upload"
                    type="file"
                    onChange={handleTemplateUpload}
                    accept=".svg"
                  />
                </>
              }
            />
          </CardContent>
        </Card>

        <Button
          onClick={generateInfographic}
          className="bg-gray-800 hover:bg-gray-700 rounded-xl"
        >
          Generate Infographic
        </Button>

        {infographic && (
          <>
            <Button
              className="bg-blue-600 rounded-xl mx-4"
              onClick={handleDownload}
            >
              Download SVG
            </Button>
            <Card>
              <CardHeader>Generated Infographic</CardHeader>
              <CardContent>
                <div
                  id="infographics_svg"
                  style={{
                    backgroundColor: bgColor,
                    display: "grid",
                    justifyItems: "center",
                    padding: "1rem",
                  }}
                  dangerouslySetInnerHTML={{ __html: infographic }}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default InfographicGenerator;
