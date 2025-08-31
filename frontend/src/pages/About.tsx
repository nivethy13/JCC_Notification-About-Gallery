import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badage";
import { Calendar, Heart, Users, Building, MapPin, Phone, Mail, BookOpen, Music, Handshake, Globe, Library, GraduationCap, Flower2, Images } from "lucide-react";
import { aboutApi } from "../services/aboutService";
import type { About as AboutType } from "../types/about";

const About: React.FC = () => {
  const [aboutData, setAboutData] = useState<AboutType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        const data = await aboutApi.getAboutContent();
        setAboutData(data);
      } catch (err) {
        setError("Failed to load about page content");
        console.error("Error fetching about data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading about page...</p>
        </div>
      </div>
    );
  }

  if (error || !aboutData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Error Loading Page</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-dark/90"
          style={{
            backgroundImage: aboutData.hero_background_url ? `url(${aboutData.hero_background_url})` : `url(/api/placeholder/1920/1080)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
            {aboutData.hero_badge}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {aboutData.hero_title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            {aboutData.hero_subtitle}
          </p>
          <div className="text-lg italic text-white/80">
            "{aboutData.hero_quote}"
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            {aboutData.mission_heading}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {aboutData.mission_subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Mission */}
          <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-primary">{aboutData.mission_title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base leading-relaxed mb-4">
                {aboutData.mission_description}
              </CardDescription>
              {aboutData.mission_quote && (
                <div className="text-sm italic text-primary/80 border-l-4 border-primary/30 pl-4">
                  "{aboutData.mission_quote}"
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vision */}
          <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-primary">{aboutData.vision_title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base leading-relaxed mb-4">
                {aboutData.vision_description}
              </CardDescription>
              {aboutData.vision_quote && (
                <div className="text-sm italic text-primary/80 border-l-4 border-primary/30 pl-4">
                  "{aboutData.vision_quote}"
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-16 bg-primary-light/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {aboutData.timeline_heading}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {aboutData.timeline_subtitle}
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary/30 hidden md:block" />
            
            <div className="space-y-12">
              {/* Timeline Events */}
              {[
                { year: aboutData.timeline_event_1_year, title: aboutData.timeline_event_1_title, description: aboutData.timeline_event_1_description },
                { year: aboutData.timeline_event_2_year, title: aboutData.timeline_event_2_title, description: aboutData.timeline_event_2_description },
                { year: aboutData.timeline_event_3_year, title: aboutData.timeline_event_3_title, description: aboutData.timeline_event_3_description }
              ].map((event, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col md:gap-8`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} text-center md:mb-0 mb-4`}>
                    <Card className="shadow-lg border-primary/20">
                      <CardHeader>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          <Badge variant="outline" className="border-primary text-primary">
                            {event.year}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base">
                          {event.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="w-6 h-6 bg-primary rounded-full border-4 border-background shadow-lg z-10 hidden md:block" />
                  
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Overview */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            {aboutData.facilities_heading}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {aboutData.facilities_subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Facilities */}
          {[
            { icon: Building, title: aboutData.facility_1_title, description: aboutData.facility_1_description },
            { icon: Users, title: aboutData.facility_2_title, description: aboutData.facility_2_description },
            { icon: Library, title: aboutData.facility_3_title, description: aboutData.facility_3_description },
            { icon: Globe, title: aboutData.facility_4_title, description: aboutData.facility_4_description }
          ].map((facility, index) => {
            const IconComponent = facility.icon;
            return (
              <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow border-primary/20">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg text-primary">{facility.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {facility.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Cultural Programs */}
      <section className="py-16 bg-primary-light/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {aboutData.cultural_heading}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {aboutData.cultural_subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Cultural Programs */}
            {[
              { icon: Flower2, title: aboutData.cultural_1_title, description: aboutData.cultural_1_description },
              { icon: BookOpen, title: aboutData.cultural_2_title, description: aboutData.cultural_2_description },
              { icon: Music, title: aboutData.cultural_3_title, description: aboutData.cultural_3_description }
            ].map((program, index) => {
              const IconComponent = program.icon;
              return (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow border-primary/20">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg text-primary">{program.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-base">
                      {program.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Outreach */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            {aboutData.outreach_heading}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {aboutData.outreach_subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Outreach Programs */}
          {[
            { icon: GraduationCap, title: aboutData.outreach_1_title, description: aboutData.outreach_1_description },
            { icon: Library, title: aboutData.outreach_2_title, description: aboutData.outreach_2_description },
            { icon: Users, title: aboutData.outreach_3_title, description: aboutData.outreach_3_description }
          ].map((program, index) => {
            const IconComponent = program.icon;
            return (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow border-primary/20">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg text-primary">{program.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base">
                    {program.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Partnerships */}
      <section className="py-16 bg-primary-light/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {aboutData.partnerships_heading}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {aboutData.partnerships_subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Partnerships */}
            {[
              { icon: Handshake, title: aboutData.partnership_1_title, description: aboutData.partnership_1_description },
              { icon: Building, title: aboutData.partnership_2_title, description: aboutData.partnership_2_description }
            ].map((partnership, index) => {
              const IconComponent = partnership.icon;
              return (
                <Card key={index} className="shadow-lg border-primary/20">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl text-primary">{partnership.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-base leading-relaxed">
                      {partnership.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing Quote Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            {aboutData.closing_title}
          </h2>
          <div className="text-2xl italic mb-8 text-white/90 max-w-3xl mx-auto">
            "{aboutData.closing_quote}"
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-semibold">
              Explore Our Events
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary font-semibold"
              onClick={() => window.location.href = '/gallery'}
            >
              <Images className="w-4 h-4 mr-2" />
              Visit Our Gallery
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-white/80">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{aboutData.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{aboutData.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{aboutData.email}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;