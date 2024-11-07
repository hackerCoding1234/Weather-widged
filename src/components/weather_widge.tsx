"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudIcon, MapPinIcon, ThermometerIcon } from "lucide-react";

interface WeatherData {
    temperature: number;
    description: string;
    location: string;
    unit: string;
}

export default function WeatherWidget() {
    const [location, setLocation] = useState<string>("");
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmedLocation = location.trim();
        if (trimmedLocation === "") {
            setError("Please Enter a Valid Location.");
            setWeather(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${trimmedLocation}`
            );
            if (!response.ok) {
                throw new Error("City not found.");
            }
            const data = await response.json();
            const weatherData: WeatherData = {
                temperature: data.current.temp_c,
                description: data.current.condition.text,
                location: data.location.name,
                unit: "C",
            };
            setWeather(weatherData);
        } catch (error) {
            setError("City not found. Please try again.");
            setWeather(null);
        } finally {
            setIsLoading(false);
        }
    };

    function getTemperatureMessage(temperature: number, unit: string): string {
        if (unit === "C") {
            if (temperature < 0) return `It's freezing at ${temperature}°C! Bundle up!`;
            if (temperature < 10) return `It's quite cold at ${temperature}°C. Wear warm clothes.`;
            if (temperature < 20) return `The temperature is ${temperature}°C. Comfortable for a light jacket.`;
            if (temperature < 30) return `It's a pleasant ${temperature}°C. Enjoy the nice weather!`;
            return `It's hot at ${temperature}°C. Stay hydrated!`;
        }
        return `${temperature}°${unit}`;
    }

    function getWeatherMessage(description: string): string {
        switch (description.toLowerCase()) {
            case "sunny": return "It's a beautiful sunny day!";
            case "partly cloudy": return "Expect some clouds and sunshine.";
            case "cloudy": return "It's cloudy today.";
            case "overcast": return "The sky is overcast.";
            case "rain": return "Don't forget your umbrella! It's raining.";
            case "thunderstorm": return "Thunderstorms are expected today.";
            case "snow": return "Bundle up! It's snowing.";
            case "mist": return "It's misty outside.";
            case "fog": return "Be careful, there's fog outside.";
            default: return description;
        }
    }

    function getLocationMessage(location: string): string {
        const currentHour = new Date().getHours();
        const isNight = currentHour >= 18 || currentHour < 6;
        return `${location} ${isNight ? "at Night" : "During the Day"}`;
    }

    return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-b from-blue-300 to-blue-100">
            <Card className="w-full max-w-md mx-auto text-center shadow-lg rounded-lg bg-white transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-gray-800">Weather Widget</CardTitle>
                    <CardDescription className="text-gray-600">Search for the current weather conditions in your city.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
                        <Input
                            type="text"
                            placeholder="Enter a city name"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                        <Button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                            {isLoading ? "Loading..." : "Search"}
                        </Button>
                    </form>
                    {error && <div className="mt-4 text-red-500">{error}</div>}
                    {weather && (
                        <div className="mt-4 grid gap-4 text-gray-800">
                            <div className="flex items-center gap-2 text-lg">
                                <ThermometerIcon className="w-6 h-6 text-blue-500" />
                                {getTemperatureMessage(weather.temperature, weather.unit)}
                            </div>
                            <div className="flex items-center gap-2 text-lg">
                                <CloudIcon className="w-6 h-6 text-blue-500" />
                                {getWeatherMessage(weather.description)}
                            </div>
                            <div className="flex items-center gap-2 text-lg">
                                <MapPinIcon className="w-6 h-6 text-blue-500" />
                                {getLocationMessage(weather.location)}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
