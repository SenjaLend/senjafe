import React from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";

const HeroHeader = () => {
  return (
    <Card className="max-w-xl mx-auto p-1 background-blur border-1 border-senja-cream backdrop-blur-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <Image
            src="/senja-logo.png"
            alt="Senja Logo"
            width={40}
            height={40}
            className="border-1 border-senja-cream rounded-full"
          />
          <span className="text-2xl font-bold">Senja</span>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default HeroHeader;
