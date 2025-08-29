
from django.db import models

# Function for custom image upload path (required by migration)
def about_image_upload_path(instance, filename):
    return f"about/{filename}"

class About(models.Model):
    
    # Hero Section (only background image is editable, rest is text)
    hero_title = models.CharField(max_length=200, default="About Jaffna Cultural Centre")
    hero_subtitle = models.TextField(default="A cultural forum for heritage, education, and harmony celebrating Tamil legacy")
    hero_badge = models.CharField(max_length=100, default="Cultural Heritage Centre")
    hero_quote = models.TextField(default="A living, breathing embodiment of Thiruvalluvar's teachings")
    hero_background = models.ImageField(upload_to='about/hero/', blank=True, null=True, help_text="Hero section background image")
    
    # Mission Section
    mission_heading = models.CharField(max_length=200, default="Our Purpose")
    mission_title = models.CharField(max_length=200, default="Our Mission")
    mission_subtitle = models.TextField(default="Dedicated to preserving, promoting, and celebrating Tamil culture")
    mission_description = models.TextField(default="To rejuvenate, promote and nurture the ancient cultural heritage of Jaffna")
    mission_quote = models.TextField(blank=True, default="Rejuvenate, promote and nurture the ancient cultural heritage")
    
    # Vision Section  
    vision_title = models.CharField(max_length=200, default="Our Vision")
    vision_description = models.TextField(default="A living, breathing embodiment of Thiruvalluvar's teachings")
    vision_quote = models.TextField(blank=True, default="A celebration of shared history and culture")
    
    # Timeline Section
    timeline_heading = models.CharField(max_length=200, default="Our Journey")
    timeline_subtitle = models.TextField(default="From India-Sri Lanka cooperation to becoming a cornerstone of Tamil heritage")
    
    # Timeline Events (3 events)
    timeline_event_1_year = models.CharField(max_length=50, default="2013-2015")
    timeline_event_1_title = models.CharField(max_length=200, default="Project Inception")
    timeline_event_1_description = models.TextField(default="India-Sri Lanka agreement signed. Foundation stone laid by Indian PM")
    
    timeline_event_2_year = models.CharField(max_length=50, default="2020-2023")
    timeline_event_2_title = models.CharField(max_length=200, default="Construction & Inauguration")
    timeline_event_2_description = models.TextField(default="Construction completed and officially dedicated by Sri Lankan and Indian leaders")
    
    timeline_event_3_year = models.CharField(max_length=50, default="2025")
    timeline_event_3_title = models.CharField(max_length=200, default="Historic Renaming")
    timeline_event_3_description = models.TextField(default="Renamed to Jaffna Thiruvalluvar Cultural Centre")
    
    # Facilities Section
    facilities_heading = models.CharField(max_length=200, default="Our Facilities")
    facilities_subtitle = models.TextField(default="World-class infrastructure designed to celebrate Tamil culture")
    
    facility_1_title = models.CharField(max_length=200, default="Cultural Museum")
    facility_1_description = models.TextField(default="Two-story museum showcasing Tamil heritage")
    
    facility_2_title = models.CharField(max_length=200, default="600-Seat Auditorium") 
    facility_2_description = models.TextField(default="Theatre-style auditorium with cutting-edge acoustics")
    
    facility_3_title = models.CharField(max_length=200, default="Learning Spire Tower")
    facility_3_description = models.TextField(default="11-story tower with digital library and classrooms")
    
    facility_4_title = models.CharField(max_length=200, default="Public Amphitheater")
    facility_4_description = models.TextField(default="Large open square for outdoor events")
    
    # Cultural Programs Section
    cultural_heading = models.CharField(max_length=200, default="Cultural Programs")
    cultural_subtitle = models.TextField(default="Celebrating diverse traditions through festivals and performances")
    
    cultural_1_title = models.CharField(max_length=200, default="International Yoga Day")
    cultural_1_description = models.TextField(default="Annual celebrations with mass participation")
    
    cultural_2_title = models.CharField(max_length=200, default="Hindi Day (Hindi Diwas)")
    cultural_2_description = models.TextField(default="Language and cultural programs with student performances")
    
    cultural_3_title = models.CharField(max_length=200, default="Tamil Arts Festivals")
    cultural_3_description = models.TextField(default="Traditional music, dance performances and exhibitions")
    
    # Outreach Section
    outreach_heading = models.CharField(max_length=200, default="Community Outreach")
    outreach_subtitle = models.TextField(default="Educational programs to strengthen community connections")
    
    outreach_1_title = models.CharField(max_length=200, default="Arts & Language Classes")
    outreach_1_description = models.TextField(default="Traditional music, dance and language instruction")
    
    outreach_2_title = models.CharField(max_length=200, default="Digital Library Access")
    outreach_2_description = models.TextField(default="Modern research resources and digital archives")
    
    outreach_3_title = models.CharField(max_length=200, default="Public Forums")
    outreach_3_description = models.TextField(default="Workshops, seminars and lecture series")
    
    # Partnerships Section
    partnerships_heading = models.CharField(max_length=200, default="Partnerships & Support")
    partnerships_subtitle = models.TextField(default="Built through India-Sri Lanka cooperation")
    
    partnership_1_title = models.CharField(max_length=200, default="India-Sri Lanka Collaboration")
    partnership_1_description = models.TextField(default="Funded by the Government of India (~USD 12 million)")
    
    partnership_2_title = models.CharField(max_length=200, default="Local Stakeholders")
    partnership_2_description = models.TextField(default="Supported by Sri Lankan ministries and councils")
    
    # Closing Section
    closing_title = models.CharField(max_length=200, default="A Cultural Bridge of Friendship")
    closing_quote = models.TextField(default="A cultural forum that embodies coexistence and cooperation")
    
    # Contact Information
    address = models.CharField(max_length=300, default="Next to Jaffna Public Library, Jaffna")
    phone = models.CharField(max_length=20, default="+94 21 222 3333")
    email = models.EmailField(default="info@jcc.lk")
    
    # Meta
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "About Page Content"
        verbose_name_plural = "About Page Content"

    def __str__(self):
        return f"About Page - {self.hero_title}"

    def save(self, *args, **kwargs):
        # Ensure only one active instance
        if self.is_active:
            About.objects.filter(is_active=True).exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)