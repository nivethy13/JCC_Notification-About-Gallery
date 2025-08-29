import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Save, ArrowLeft, Eye, RefreshCw, CheckCircle, 
  FileText, Image as ImageIcon, Users, MapPin, Phone, Mail
} from 'lucide-react';
import { aboutApi } from '../../services/aboutService';
import type{ About } from '../../types/about';

const AboutMangement: React.FC = () => {
  const [aboutData, setAboutData] = useState<About | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    // Hero Section
    hero_title: '',
    hero_subtitle: '',
    hero_badge: '',
    hero_quote: '',
    hero_background: null as File | null,

    // Mission Section
    mission_heading: '',
    mission_title: '',
    mission_subtitle: '',
    mission_description: '',
    mission_quote: '',

    // Vision Section
    vision_title: '',
    vision_description: '',
    vision_quote: '',

    // Timeline Section
    timeline_heading: '',
    timeline_subtitle: '',
    timeline_event_1_year: '',
    timeline_event_1_title: '',
    timeline_event_1_description: '',
    timeline_event_2_year: '',
    timeline_event_2_title: '',
    timeline_event_2_description: '',
    timeline_event_3_year: '',
    timeline_event_3_title: '',
    timeline_event_3_description: '',

    // Facilities Section
    facilities_heading: '',
    facilities_subtitle: '',
    facility_1_title: '',
    facility_1_description: '',
    facility_2_title: '',
    facility_2_description: '',
    facility_3_title: '',
    facility_3_description: '',
    facility_4_title: '',
    facility_4_description: '',

    // Cultural Programs Section
    cultural_heading: '',
    cultural_subtitle: '',
    cultural_1_title: '',
    cultural_1_description: '',
    cultural_2_title: '',
    cultural_2_description: '',
    cultural_3_title: '',
    cultural_3_description: '',

    // Outreach Section
    outreach_heading: '',
    outreach_subtitle: '',
    outreach_1_title: '',
    outreach_1_description: '',
    outreach_2_title: '',
    outreach_2_description: '',
    outreach_3_title: '',
    outreach_3_description: '',

    // Partnerships Section
    partnerships_heading: '',
    partnerships_subtitle: '',
    partnership_1_title: '',
    partnership_1_description: '',
    partnership_2_title: '',
    partnership_2_description: '',

    // Closing Section
    closing_title: '',
    closing_quote: '',

    // Contact
    address: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const data = await aboutApi.getAboutContent();
      setAboutData(data);
      
      // Populate form with fetched data
      const formFields = { ...data };
      delete formFields.id;
      delete formFields.is_active;
      delete formFields.updated_at;
      delete formFields.hero_background;
      delete formFields.hero_background_url;
      
      setFormData({
        ...formFields,
        hero_background: null
      });
      
      if (data.hero_background_url) {
        setPreviewImage(data.hero_background_url);
      }
    } catch (err) {
      setError("Failed to load about page content");
      console.error("Error fetching about data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, hero_background: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      const updateData: any = { ...formData };
      
      // Only include hero_background if a new file was selected
      if (!formData.hero_background) {
        delete updateData.hero_background;
      }
      
      await aboutApi.updateAboutContent(updateData);
      setSaveSuccess(true);
      
      // Refresh data to get updated timestamps
      await fetchAboutData();
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save changes. Please try again.");
      console.error("Error saving about data:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading about content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
              <h1 className="text-4xl font-bold text-foreground">About Page Management</h1>
              <p className="text-muted-foreground mt-2">Edit all content for the About page</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => window.open('/about', '_blank')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" onClick={fetchAboutData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Status Messages */}
          {saveSuccess && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                About page content saved successfully!
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Last Updated */}
          {aboutData && (
            <div className="mt-4 text-sm text-muted-foreground">
              Last updated: {new Date(aboutData.updated_at).toLocaleString()}
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Hero Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Hero Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hero_title">Title</Label>
                  <Input
                    id="hero_title"
                    value={formData.hero_title}
                    onChange={(e) => handleInputChange('hero_title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hero_badge">Badge Text</Label>
                  <Input
                    id="hero_badge"
                    value={formData.hero_badge}
                    onChange={(e) => handleInputChange('hero_badge', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="hero_subtitle">Subtitle</Label>
                <Textarea
                  id="hero_subtitle"
                  value={formData.hero_subtitle}
                  onChange={(e) => handleInputChange('hero_subtitle', e.target.value)}
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="hero_quote">Quote</Label>
                <Textarea
                  id="hero_quote"
                  value={formData.hero_quote}
                  onChange={(e) => handleInputChange('hero_quote', e.target.value)}
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="hero_background">Background Image</Label>
                <Input
                  id="hero_background"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {previewImage && (
                  <div className="mt-2">
                    <img
                      src={previewImage}
                      alt="Hero background preview"
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mission & Vision */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Mission & Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section Headers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mission_heading">Mission Heading</Label>
                  <Input
                    id="mission_heading"
                    value={formData.mission_heading}
                    onChange={(e) => handleInputChange('mission_heading', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="mission_subtitle">Mission Subtitle</Label>
                  <Input
                    id="mission_subtitle"
                    value={formData.mission_subtitle}
                    onChange={(e) => handleInputChange('mission_subtitle', e.target.value)}
                  />
                </div>
              </div>

              {/* Mission */}
              <div className="space-y-4 p-4 bg-gray-50 rounded">
                <h4 className="font-semibold">Mission Details</h4>
                <div>
                  <Label htmlFor="mission_title">Mission Title</Label>
                  <Input
                    id="mission_title"
                    value={formData.mission_title}
                    onChange={(e) => handleInputChange('mission_title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="mission_description">Mission Description</Label>
                  <Textarea
                    id="mission_description"
                    value={formData.mission_description}
                    onChange={(e) => handleInputChange('mission_description', e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="mission_quote">Mission Quote</Label>
                  <Input
                    id="mission_quote"
                    value={formData.mission_quote}
                    onChange={(e) => handleInputChange('mission_quote', e.target.value)}
                  />
                </div>
              </div>

              {/* Vision */}
              <div className="space-y-4 p-4 bg-blue-50 rounded">
                <h4 className="font-semibold">Vision Details</h4>
                <div>
                  <Label htmlFor="vision_title">Vision Title</Label>
                  <Input
                    id="vision_title"
                    value={formData.vision_title}
                    onChange={(e) => handleInputChange('vision_title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="vision_description">Vision Description</Label>
                  <Textarea
                    id="vision_description"
                    value={formData.vision_description}
                    onChange={(e) => handleInputChange('vision_description', e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="vision_quote">Vision Quote</Label>
                  <Input
                    id="vision_quote"
                    value={formData.vision_quote}
                    onChange={(e) => handleInputChange('vision_quote', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Journey Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeline_heading">Timeline Heading</Label>
                  <Input
                    id="timeline_heading"
                    value={formData.timeline_heading}
                    onChange={(e) => handleInputChange('timeline_heading', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="timeline_subtitle">Timeline Subtitle</Label>
                  <Input
                    id="timeline_subtitle"
                    value={formData.timeline_subtitle}
                    onChange={(e) => handleInputChange('timeline_subtitle', e.target.value)}
                  />
                </div>
              </div>

              {/* Timeline Events */}
              {[1, 2, 3].map((num) => (
                <div key={num} className="space-y-4 p-4 bg-gray-50 rounded">
                  <h4 className="font-semibold">Timeline Event {num}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`timeline_event_${num}_year`}>Year</Label>
                      <Input
                        id={`timeline_event_${num}_year`}
                        value={formData[`timeline_event_${num}_year` as keyof typeof formData] as string}
                        onChange={(e) => handleInputChange(`timeline_event_${num}_year` as keyof typeof formData, e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`timeline_event_${num}_title`}>Title</Label>
                      <Input
                        id={`timeline_event_${num}_title`}
                        value={formData[`timeline_event_${num}_title` as keyof typeof formData] as string}
                        onChange={(e) => handleInputChange(`timeline_event_${num}_title` as keyof typeof formData, e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`timeline_event_${num}_description`}>Description</Label>
                    <Textarea
                      id={`timeline_event_${num}_description`}
                      value={formData[`timeline_event_${num}_description` as keyof typeof formData] as string}
                      onChange={(e) => handleInputChange(`timeline_event_${num}_description` as keyof typeof formData, e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Facilities Section */}
          <Card>
            <CardHeader>
              <CardTitle>Facilities Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facilities_heading">Facilities Heading</Label>
                  <Input
                    id="facilities_heading"
                    value={formData.facilities_heading}
                    onChange={(e) => handleInputChange('facilities_heading', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="facilities_subtitle">Facilities Subtitle</Label>
                  <Input
                    id="facilities_subtitle"
                    value={formData.facilities_subtitle}
                    onChange={(e) => handleInputChange('facilities_subtitle', e.target.value)}
                  />
                </div>
              </div>

              {/* Facilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="space-y-2 p-4 bg-gray-50 rounded">
                    <h4 className="font-semibold">Facility {num}</h4>
                    <div>
                      <Label htmlFor={`facility_${num}_title`}>Title</Label>
                      <Input
                        id={`facility_${num}_title`}
                        value={formData[`facility_${num}_title` as keyof typeof formData] as string}
                        onChange={(e) => handleInputChange(`facility_${num}_title` as keyof typeof formData, e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`facility_${num}_description`}>Description</Label>
                      <Textarea
                        id={`facility_${num}_description`}
                        value={formData[`facility_${num}_description` as keyof typeof formData] as string}
                        onChange={(e) => handleInputChange(`facility_${num}_description` as keyof typeof formData, e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cultural Programs Section */}
          <Card>
            <CardHeader>
              <CardTitle>Cultural Programs Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cultural_heading">Cultural Heading</Label>
                  <Input
                    id="cultural_heading"
                    value={formData.cultural_heading}
                    onChange={(e) => handleInputChange('cultural_heading', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cultural_subtitle">Cultural Subtitle</Label>
                  <Input
                    id="cultural_subtitle"
                    value={formData.cultural_subtitle}
                    onChange={(e) => handleInputChange('cultural_subtitle', e.target.value)}
                  />
                </div>
              </div>

              {/* Cultural Programs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="space-y-2 p-4 bg-gray-50 rounded">
                    <h4 className="font-semibold">Program {num}</h4>
                    <div>
                      <Label htmlFor={`cultural_${num}_title`}>Title</Label>
                      <Input
                        id={`cultural_${num}_title`}
                        value={formData[`cultural_${num}_title` as keyof typeof formData] as string}
                        onChange={(e) => handleInputChange(`cultural_${num}_title` as keyof typeof formData, e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`cultural_${num}_description`}>Description</Label>
                      <Textarea
                        id={`cultural_${num}_description`}
                        value={formData[`cultural_${num}_description` as keyof typeof formData] as string}
                        onChange={(e) => handleInputChange(`cultural_${num}_description` as keyof typeof formData, e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Outreach Section */}
          <Card>
            <CardHeader>
              <CardTitle>Community Outreach Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="outreach_heading">Outreach Heading</Label>
                  <Input
                    id="outreach_heading"
                    value={formData.outreach_heading}
                    onChange={(e) => handleInputChange('outreach_heading', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="outreach_subtitle">Outreach Subtitle</Label>
                  <Input
                    id="outreach_subtitle"
                    value={formData.outreach_subtitle}
                    onChange={(e) => handleInputChange('outreach_subtitle', e.target.value)}
                  />
                </div>
              </div>

              {/* Outreach Programs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="space-y-2 p-4 bg-gray-50 rounded">
                    <h4 className="font-semibold">Program {num}</h4>
                    <div>
                      <Label htmlFor={`outreach_${num}_title`}>Title</Label>
                      <Input
                        id={`outreach_${num}_title`}
                        value={formData[`outreach_${num}_title` as keyof typeof formData] as string}
                        onChange={(e) => handleInputChange(`outreach_${num}_title` as keyof typeof formData, e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`outreach_${num}_description`}>Description</Label>
                      <Textarea
                        id={`outreach_${num}_description`}
                        value={formData[`outreach_${num}_description` as keyof typeof formData] as string}
                        onChange={(e) => handleInputChange(`outreach_${num}_description` as keyof typeof formData, e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Partnerships Section */}
          <Card>
            <CardHeader>
              <CardTitle>Partnerships Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="partnerships_heading">Partnerships Heading</Label>
                  <Input
                    id="partnerships_heading"
                    value={formData.partnerships_heading}
                    onChange={(e) => handleInputChange('partnerships_heading', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="partnerships_subtitle">Partnerships Subtitle</Label>
                  <Input
                    id="partnerships_subtitle"
                    value={formData.partnerships_subtitle}
                    onChange={(e) => handleInputChange('partnerships_subtitle', e.target.value)}
                  />
                </div>
              </div>

              {/* Partnerships */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((num) => (
                  <div key={num} className="space-y-2 p-4 bg-gray-50 rounded">
                    <h4 className="font-semibold">Partnership {num}</h4>
                    <div>
                      <Label htmlFor={`partnership_${num}_title`}>Title</Label>
                      <Input
                        id={`partnership_${num}_title`}
                        value={formData[`partnership_${num}_title` as keyof typeof formData] as string}
                        onChange={(e) => handleInputChange(`partnership_${num}_title` as keyof typeof formData, e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`partnership_${num}_description`}>Description</Label>
                      <Textarea
                        id={`partnership_${num}_description`}
                        value={formData[`partnership_${num}_description` as keyof typeof formData] as string}
                        onChange={(e) => handleInputChange(`partnership_${num}_description` as keyof typeof formData, e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Closing & Contact Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Closing & Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="closing_title">Closing Title</Label>
                <Input
                  id="closing_title"
                  value={formData.closing_title}
                  onChange={(e) => handleInputChange('closing_title', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="closing_quote">Closing Quote</Label>
                <Textarea
                  id="closing_quote"
                  value={formData.closing_quote}
                  onChange={(e) => handleInputChange('closing_quote', e.target.value)}
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="address" className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              size="lg"
              disabled={saving}
              className="min-w-[150px]"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AboutMangement;