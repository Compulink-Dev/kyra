"use client";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

function Page() {
  const [loading, setLoading] = useState(false);

  const handleBlocking = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/blocking", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        console.log("Generated content:", data.result);
        // Do something with the result
      } else {
        console.error("Failed:", data.error);
      }
    } catch (error) {
      console.error("Request failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleBlocking} disabled={loading}>
        {loading ? "Generating..." : "Blocking"}
      </Button>
    </div>
  );
}

export default Page;
