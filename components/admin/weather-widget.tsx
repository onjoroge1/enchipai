"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Cloud, Droplets, Wind, Thermometer, Eye } from "lucide-react";

const forecast = [
  { day: "Today", icon: Sun, high: 28, low: 18, condition: "Sunny" },
  { day: "Tue", icon: Sun, high: 29, low: 17, condition: "Clear" },
  { day: "Wed", icon: Cloud, high: 26, low: 16, condition: "Partly Cloudy" },
  { day: "Thu", icon: Droplets, high: 24, low: 15, condition: "Light Rain" },
  { day: "Fri", icon: Sun, high: 27, low: 17, condition: "Sunny" },
];

export function WeatherWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Weather Conditions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Masai Mara</p>
              <p className="text-4xl font-bold text-foreground">28°C</p>
              <p className="text-sm text-muted-foreground">Sunny</p>
            </div>
            <Sun className="w-16 h-16 text-amber-500" />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-amber-200">
            <div className="text-center">
              <Droplets className="w-4 h-4 mx-auto text-muted-foreground" />
              <p className="text-xs text-muted-foreground mt-1">Humidity</p>
              <p className="text-sm font-medium">45%</p>
            </div>
            <div className="text-center">
              <Wind className="w-4 h-4 mx-auto text-muted-foreground" />
              <p className="text-xs text-muted-foreground mt-1">Wind</p>
              <p className="text-sm font-medium">12 km/h</p>
            </div>
            <div className="text-center">
              <Eye className="w-4 h-4 mx-auto text-muted-foreground" />
              <p className="text-xs text-muted-foreground mt-1">Visibility</p>
              <p className="text-sm font-medium">Excellent</p>
            </div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">5-Day Forecast</h4>
          <div className="space-y-2">
            {forecast.map((day) => (
              <div key={day.day} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm font-medium w-12">{day.day}</span>
                <day.icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground flex-1 text-center">{day.condition}</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{day.high}°</span>
                  <span className="text-muted-foreground">{day.low}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safari Conditions */}
        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Excellent Safari Conditions</p>
              <p className="text-xs text-green-700">Clear skies, good for morning game drives</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
