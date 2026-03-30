"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2 } from "lucide-react";

interface CountryData {
  country: string;
  guests: number;
  percentage: number;
}

interface PurposeData {
  name: string;
  value: number;
  color: string;
  count: number;
}

interface AgeData {
  range: string;
  guests: number;
}

export function GuestDemographics() {
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [purposeData, setPurposeData] = useState<PurposeData[]>([]);
  const [ageData, setAgeData] = useState<AgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDemographics();
  }, []);

  async function fetchDemographics() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/analytics/demographics");
      if (!response.ok) throw new Error("Failed to fetch demographics");
      const data = await response.json();
      
      setCountryData(data.data?.countries || []);
      setPurposeData(data.data?.travelPurpose || []);
      setAgeData(data.data?.ageDistribution || []);
    } catch (err) {
      console.error("Demographics fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load demographics");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-12 text-center text-muted-foreground">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Countries */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif">Guest Origins</CardTitle>
          <p className="text-sm text-muted-foreground">Top countries</p>
        </CardHeader>
        <CardContent>
          {countryData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
          ) : (
            <div className="space-y-4">
              {countryData.map((item) => (
                <div key={item.country}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{item.country}</span>
                    <span className="text-sm text-muted-foreground">{item.guests}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Travel Purpose */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif">Travel Purpose</CardTitle>
          <p className="text-sm text-muted-foreground">Why guests visit</p>
        </CardHeader>
        <CardContent>
          {purposeData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
          ) : (
            <>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={purposeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {purposeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, ""]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e5e5",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {purposeData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Age Distribution */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif">Age Distribution</CardTitle>
          <p className="text-sm text-muted-foreground">Guest age ranges</p>
        </CardHeader>
        <CardContent>
          {ageData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
          ) : (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#666" }} />
                  <YAxis 
                    dataKey="range" 
                    type="category" 
                    tick={{ fontSize: 11, fill: "#666" }}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="guests" fill="#8B5E3C" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
