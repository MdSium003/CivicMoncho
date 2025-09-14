import React, { useEffect, useRef, useState } from 'react';
import { MapPin, LocateFixed, Siren, Users, Landmark, HeartPulse, School, Building } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// --- Service Locations Data ---
// A larger, more detailed list of locations focused on the Motijheel area and surroundings.
const serviceLocations = [
    // ========================================================================
    // Police Stations
    // ========================================================================
    { lat: 23.7355, lng: 90.4125, nameEn: 'Motijheel Police Station', nameBn: 'মতিঝিল থানা', category: 'police' },
    { lat: 23.729, lng: 90.407, nameEn: 'Ramna Model Police Station', nameBn: 'রমনা মডেল থানা', category: 'police' },
    { lat: 23.725, lng: 90.410, nameEn: 'Paltan Police Station', nameBn: 'পল্টন থানা', category: 'police' },
    { lat: 23.719, lng: 90.422, nameEn: 'Wari Police Station', nameBn: 'ওয়ারী থানা', category: 'police' },
    { lat: 23.759, lng: 90.385, nameEn: 'Tejgaon Thana', nameBn: 'তেজগাঁও থানা', category: 'police' },
    { lat: 23.715, lng: 90.415, nameEn: 'Sutrapur Police Station', nameBn: 'সূত্রাপুর থানা', category: 'police' },
    { lat: 23.743, lng: 90.399, nameEn: 'Shahbag Police Station', nameBn: 'শাহবাগ থানা', category: 'police' },
    { lat: 23.746, lng: 90.372, nameEn: 'Dhanmondi Police Station', nameBn: 'ধানমন্ডি থানা', category: 'police' },
    { lat: 23.792, lng: 90.414, nameEn: 'Gulshan Police Station', nameBn: 'গুলশান থানা', category: 'police' },
    { lat: 23.799, lng: 90.406, nameEn: 'Banani Police Station', nameBn: 'বনানী থানা', category: 'police' },
    { lat: 23.804, lng: 90.360, nameEn: 'Mirpur Model Police Station', nameBn: 'মিরপুর মডেল থানা', category: 'police' },
    { lat: 23.778, lng: 90.381, nameEn: 'Mohammadpur Police Station', nameBn: 'মোহাম্মদপুর থানা', category: 'police' },
    { lat: 23.875, lng: 90.395, nameEn: 'Uttara West Police Station', nameBn: 'উত্তরা পশ্চিম থানা', category: 'police' },
    { lat: 23.864, lng: 90.414, nameEn: 'Uttara East Police Station', nameBn: 'উত্তরা পূর্ব থানা', category: 'police' },
    { lat: 23.784, lng: 90.426, nameEn: 'Badda Police Station', nameBn: 'বাড্ডা থানা', category: 'police' },
    { lat: 23.709, lng: 90.424, nameEn: 'Jatrabari Police Station', nameBn: 'যাত্রাবাড়ী থানা', category: 'police' },
    { lat: 23.708, lng: 90.406, nameEn: 'Kotwali Police Station', nameBn: 'কোতোয়ালী থানা', category: 'police' },
    { lat: 23.713, lng: 90.396, nameEn: 'Lalbagh Police Station', nameBn: 'লালবাগ থানা', category: 'police' },
    { lat: 23.754, lng: 90.424, nameEn: 'Rampura Police Station', nameBn: 'রামপুরা থানা', category: 'police' },
    { lat: 23.773, lng: 90.406, nameEn: 'Kafrul Police Station', nameBn: 'কাফরুল থানা', category: 'police' },

    // ========================================================================
    // Public Toilets
    // ========================================================================
    { lat: 23.730, lng: 90.414, nameEn: 'Public Toilet - Motijheel Circle', nameBn: 'পাবলিক টয়লেট - মতিঝিল চত্বর', category: 'toilet' },
    { lat: 23.726, lng: 90.409, nameEn: 'Public Toilet - National Press Club', nameBn: 'পাবলিক টয়লেট - জাতীয় প্রেস ক্লাব', category: 'toilet' },
    { lat: 23.733, lng: 90.405, nameEn: 'Public Toilet - Ramna Park Gate', nameBn: 'পাবলিক টয়লেট - রমনা পার্ক গেট', category: 'toilet' },
    { lat: 23.722, lng: 90.413, nameEn: 'Public Toilet - Gulistan Park', nameBn: 'পাবলিক টয়লেট - গুলিস্তান পার্ক', category: 'toilet' },
    { lat: 23.739, lng: 90.418, nameEn: 'Public Toilet - Kamalapur Station', nameBn: 'পাবলিক টয়লেট - কমলাপুর স্টেশন', category: 'toilet' },
    { lat: 23.746, lng: 90.394, nameEn: 'Public Toilet - Kawran Bazar', nameBn: 'পাবলিক টয়লেট - কাওরান বাজার', category: 'toilet' },
    { lat: 23.752, lng: 90.386, nameEn: 'Public Toilet - Farmgate', nameBn: 'পাবলিক টয়লেট - ফার্মগেট', category: 'toilet' },
    { lat: 23.873, lng: 90.399, nameEn: 'Public Toilet - Uttara Rabindra Sarani', nameBn: 'পাবলিক টয়লেট - উত্তরা রবীন্দ্র সরণি', category: 'toilet' },
    { lat: 23.799, lng: 90.408, nameEn: 'Public Toilet - Banani Chairman Bari', nameBn: 'পাবলিক টয়লেট - বনানী চেয়ারম্যান বাড়ী', category: 'toilet' },
    { lat: 23.779, lng: 90.366, nameEn: 'Public Toilet - Shyamoli', nameBn: 'পাবলিক টয়লেট - শ্যামলী', category: 'toilet' },
    { lat: 23.784, lng: 90.358, nameEn: 'Public Toilet - Gabtoli', nameBn: 'পাবলিক টয়লেট - গাবতলী', category: 'toilet' },
    { lat: 23.788, lng: 90.419, nameEn: 'Public Toilet - Nadda', nameBn: 'পাবলিক টয়লেট - নদ্দা', category: 'toilet' },
    { lat: 23.723, lng: 90.434, nameEn: 'Public Toilet - Sayedabad', nameBn: 'পাবলিক টয়লেট - সায়েদাবাদ', category: 'toilet' },
    { lat: 23.708, lng: 90.410, nameEn: 'Public Toilet - Sadarghat', nameBn: 'পাবলিক টয়লেট - সদরঘাট', category: 'toilet' },
    { lat: 23.811, lng: 90.364, nameEn: 'Public Toilet - Mirpur 10 Circle', nameBn: 'পাবলিক টয়লেট - মিরপুর ১০ চত্বর', category: 'toilet' },

    // ========================================================================
    // Mosques
    // ========================================================================
    { lat: 23.723, lng: 90.408, nameEn: 'Baitul Mukarram National Mosque', nameBn: 'বায়তুল মোকাররম জাতীয় মসজিদ', category: 'mosque' },
    { lat: 23.731, lng: 90.416, nameEn: 'Motijheel Baitus Salat Jame Masjid', nameBn: 'মতিঝিল বাইতুস সালাত জামে মসজিদ', category: 'mosque' },
    { lat: 23.728, lng: 90.419, nameEn: 'Arambag Jame Mosque', nameBn: 'আরামবাগ জামে মসজিদ', category: 'mosque' },
    { lat: 23.736, lng: 90.423, nameEn: 'Kamalapur Jame Mosque', nameBn: 'কমলাপুর জামে মসজিদ', category: 'mosque' },
    { lat: 23.727, lng: 90.411, nameEn: 'Paltan Maidan Jame Masjid', nameBn: 'পল্টন ময়দান জামে মসজিদ', category: 'mosque' },
    { lat: 23.733, lng: 90.417, nameEn: 'T&T Colony Jame Masjid', nameBn: 'টিএন্ডটি কলোনী জামে মসজিদ', category: 'mosque' },
    { lat: 23.721, lng: 90.415, nameEn: 'Gulistan Central Jame Mosque', nameBn: 'গুলিস্তান কেন্দ্রীয় জামে মসজিদ', category: 'mosque' },
    { lat: 23.738, lng: 90.414, nameEn: 'Shapla Chattar Jame Masjid', nameBn: 'শাপলা চত্বর জামে মসজিদ', category: 'mosque' },
    { lat: 23.73, lng: 90.42, nameEn: 'Fakirapool Jame Mosque', nameBn: 'ফকিরাপুল জামে মসজিদ', category: 'mosque' },
    { lat: 23.7255, lng: 90.418, nameEn: 'Dilkusha Jame Mosque', nameBn: 'দিলকুশা জামে মসজিদ', category: 'mosque' },
    { lat: 23.729, lng: 90.403, nameEn: 'Kakrail Mosque', nameBn: 'কাকরাইল মসজিদ', category: 'mosque' },
    { lat: 23.712, lng: 90.405, nameEn: 'Star Mosque (Tara Masjid)', nameBn: 'তারা মসজিদ', category: 'mosque' },
    { lat: 23.718, lng: 90.388, nameEn: 'Khan Mohammad Mridha Mosque', nameBn: 'খান মোহাম্মদ মৃধা মসজিদ', category: 'mosque' },
    { lat: 23.754, lng: 90.369, nameEn: 'Sat Gambuj Mosque', nameBn: 'সাত গম্বুজ মসজিদ', category: 'mosque' },
    { lat: 23.793, lng: 90.411, nameEn: 'Gulshan Azad Mosque', nameBn: 'গুলশান আজাদ মসজিদ', category: 'mosque' },
    { lat: 23.71, lng: 90.409, nameEn: 'Chawkbazar Shahi Mosque', nameBn: 'চকবাজার শাহী মসজিদ', category: 'mosque' },
    { lat: 23.743, lng: 90.400, nameEn: 'Dhaka University Central Mosque', nameBn: 'ঢাকা বিশ্ববিদ্যালয় কেন্দ্রীয় মসজিদ', category: 'mosque' },
    { lat: 23.875, lng: 90.402, nameEn: 'Uttara Central Mosque', nameBn: 'উত্তরা কেন্দ্রীয় মসজিদ', category: 'mosque' },
    
    // ========================================================================
    // Healthcare
    // ========================================================================
    { lat: 23.738, lng: 90.421, nameEn: 'Islami Bank Hospital Motijheel', nameBn: 'ইসলামী ব্যাংক হাসপাতাল মতিঝিল', category: 'healthcare' },
    { lat: 23.741, lng: 90.412, nameEn: 'Dhaka Medical College Hospital', nameBn: 'ঢাকা মেডিকেল কলেজ হাসপাতাল', category: 'healthcare' },
    { lat: 23.745, lng: 90.408, nameEn: 'Bangabandhu Sheikh Mujib Medical University (BSMMU)', nameBn: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয় (বিএসএমএমইউ)', category: 'healthcare' },
    { lat: 23.728, lng: 90.425, nameEn: 'Motijheel General Hospital', nameBn: 'মতিঝিল জেনারেল হাসপাতাল', category: 'healthcare' },
    { lat: 23.732, lng: 90.401, nameEn: 'Birdem General Hospital', nameBn: 'বারডেম জেনারেল হাসপাতাল', category: 'healthcare' },
    { lat: 23.747, lng: 90.379, nameEn: 'Square Hospitals Ltd.', nameBn: 'স্কয়ার হসপিটালস লিমিটেড', category: 'healthcare' },
    { lat: 23.788, lng: 90.417, nameEn: 'United Hospital Limited', nameBn: 'ইউনাইটেড হাসপাতাল লিমিটেড', category: 'healthcare' },
    { lat: 23.756, lng: 90.383, nameEn: 'Samorita Hospital', nameBn: 'সমরিতা হাসপাতাল', category: 'healthcare' },
    { lat: 23.753, lng: 90.426, nameEn: 'Evercare Hospital Dhaka', nameBn: 'এভারকেয়ার হসপিটাল ঢাকা', category: 'healthcare' },
    { lat: 23.778, lng: 90.406, nameEn: 'Kurmitola General Hospital', nameBn: 'কুর্মিটোলা জেনারেল হাসপাতাল', category: 'healthcare' },
    { lat: 23.710, lng: 90.401, nameEn: 'Sir Salimullah Medical College Hospital (Mitford)', nameBn: 'স্যার সলিমুল্লাহ মেডিকেল কলেজ হাসপাতাল (মিটফোর্ড)', category: 'healthcare' },
    { lat: 23.748, lng: 90.370, nameEn: 'Dhaka Shishu (Children) Hospital', nameBn: 'ঢাকা শিশু হাসপাতাল', category: 'healthcare' },
    { lat: 23.750, lng: 90.375, nameEn: 'National Institute of Cardiovascular Diseases (NICVD)', nameBn: 'জাতীয় হৃদরোগ ইনস্টিটিউট ও হাসপাতাল', category: 'healthcare' },
    { lat: 23.740, lng: 90.368, nameEn: 'Labaid Specialized Hospital', nameBn: 'ল্যাবএইড বিশেষায়িত হাসপাতাল', category: 'healthcare' },
    { lat: 23.784, lng: 90.407, nameEn: 'Combined Military Hospital (CMH)', nameBn: 'সম্মিলিত সামরিক হাসপাতাল (সিএমএইচ)', category: 'healthcare' },

    // ========================================================================
    // Education
    // ========================================================================
    { lat: 23.736, lng: 90.417, nameEn: 'Motijheel Ideal School and College', nameBn: 'মতিঝিল আইডিয়াল স্কুল অ্যান্ড কলেজ', category: 'education' },
    { lat: 23.734, lng: 90.419, nameEn: 'Motijheel Govt. Boys\' High School', nameBn: 'মতিঝিল সরকারি বালক উচ্চ বিদ্যালয়', category: 'education' },
    { lat: 23.729, lng: 90.422, nameEn: 'Notre Dame College', nameBn: 'নটর ডেম কলেজ', category: 'education' },
    { lat: 23.726, lng: 90.395, nameEn: 'University of Dhaka', nameBn: 'ঢাকা বিশ্ববিদ্যালয়', category: 'education' },
    { lat: 23.731, lng: 90.41, nameEn: 'Willes Little Flower School & College', nameBn: 'উইলস লিটল ফ্লাওয়ার স্কুল অ্যান্ড কলেজ', category: 'education' },
    { lat: 23.726, lng: 90.391, nameEn: 'Bangladesh University of Engineering and Technology (BUET)', nameBn: 'বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয় (বুয়েট)', category: 'education' },
    { lat: 23.737, lng: 90.386, nameEn: 'Dhaka College', nameBn: 'ঢাকা কলেজ', category: 'education' },
    { lat: 23.739, lng: 90.411, nameEn: 'Viqarunnisa Noon School & College', nameBn: 'ভিকারুননিসা নূন স্কুল এন্ড কলেজ', category: 'education' },
    { lat: 23.763, lng: 90.370, nameEn: 'St. Joseph Higher Secondary School', nameBn: 'সেন্ট যোসেফ উচ্চ মাধ্যমিক বিদ্যালয়', category: 'education' },
    { lat: 23.791, lng: 90.423, nameEn: 'North South University', nameBn: 'নর্থ সাউথ বিশ্ববিদ্যালয়', category: 'education' },
    { lat: 23.777, lng: 90.405, nameEn: 'BRAC University', nameBn: 'ব্র্যাক বিশ্ববিদ্যালয়', category: 'education' },
    { lat: 23.820, lng: 90.368, nameEn: 'Mirpur Cantonment Public School and College', nameBn: 'মিরপুর ক্যান্টনমেন্ট পাবলিক স্কুল ও কলেজ', category: 'education' },
    { lat: 23.874, lng: 90.400, nameEn: 'Rajuk Uttara Model College', nameBn: 'রাজউক উত্তরা মডেল কলেজ', category: 'education' },
    { lat: 23.743, lng: 90.384, nameEn: 'Holy Cross College', nameBn: 'হলি ক্রস কলেজ', category: 'education' },
    { lat: 23.710, lng: 90.412, nameEn: 'Kabi Nazrul Government College', nameBn: 'কবি নজরুল সরকারি কলেজ', category: 'education' },

    // ========================================================================
    // Government Offices
    // ========================================================================
    { lat: 23.729, lng: 90.415, nameEn: 'Bangladesh Bank', nameBn: 'বাংলাদেশ ব্যাংক', category: 'government' },
    { lat: 23.726, lng: 90.412, nameEn: 'Bangladesh Secretariat', nameBn: 'বাংলাদেশ সচিবালয়', category: 'government' },
    { lat: 23.733, lng: 90.414, nameEn: 'Jiban Bima Tower', nameBn: 'জীবন বীমা টাওয়ার', category: 'government' },
    { lat: 23.737, lng: 90.413, nameEn: 'Dhaka Stock Exchange', nameBn: 'ঢাকা স্টক এক্সচেঞ্জ', category: 'government' },
    { lat: 23.724, lng: 90.407, nameEn: 'Ministry of Foreign Affairs', nameBn: 'পররাষ্ট্র মন্ত্রণালয়', category: 'government' },
    { lat: 23.760, lng: 90.388, nameEn: 'Prime Minister\'s Office', nameBn: 'প্রধানমন্ত্রীর কার্যালয়', category: 'government' },
    { lat: 23.753, lng: 90.377, nameEn: 'Jatiya Sangsad Bhaban (National Parliament)', nameBn: 'জাতীয় সংসদ ভবন', category: 'government' },
    { lat: 23.757, lng: 90.379, nameEn: 'Election Commission Secretariat', nameBn: 'নির্বাচন কমিশন সচিবালয়', category: 'government' },
    { lat: 23.793, lng: 90.409, nameEn: 'Dhaka North City Corporation (DNCC)', nameBn: 'ঢাকা উত্তর সিটি কর্পোরেশন', category: 'government' },
    { lat: 23.720, lng: 90.414, nameEn: 'Dhaka South City Corporation (DSCC)', nameBn: 'ঢাকা দক্ষিণ সিটি কর্পোরেশন', category: 'government' },
    { lat: 23.734, lng: 90.407, nameEn: 'Supreme Court of Bangladesh', nameBn: 'বাংলাদেশ সুপ্রীম কোর্ট', category: 'government' },
    { lat: 23.766, lng: 90.395, nameEn: 'Department of Immigration & Passports', nameBn: 'ইমিগ্রেশন ও পাসপোর্ট অধিদপ্তর', category: 'government' },
    { lat: 23.738, lng: 90.408, nameEn: 'National Board of Revenue (NBR)', nameBn: 'জাতীয় রাজস্ব বোর্ড', category: 'government' },
    { lat: 23.791, lng: 90.383, nameEn: 'Civil Aviation Authority of Bangladesh (CAAB)', nameBn: 'বেসামরিক বিমান চলাচল কর্তৃপক্ষ', category: 'government' },
    { lat: 23.729, lng: 90.428, nameEn: 'RAJUK Bhaban', nameBn: 'রাজউক ভবন', category: 'government' },
];


const categories = [
    { id: 'all', nameEn: 'All Services', nameBn: 'সকল পরিষেবা', icon: MapPin },
    { id: 'police', nameEn: 'Police Stations', nameBn: 'থানা', icon: Siren },
    { id: 'toilet', nameEn: 'Public Toilets', nameBn: 'গণশৌচাগার', icon: Users },
    { id: 'mosque', nameEn: 'Mosques', nameBn: 'মসজিদ', icon: Landmark },
    { id: 'healthcare', nameEn: 'Healthcare', nameBn: 'স্বাস্থ্যসেবা', icon: HeartPulse },
    { id: 'education', nameEn: 'Education', nameBn: 'শিক্ষা', icon: School },
    { id: 'government', nameEn: 'Govt. Offices', nameBn: 'সরকারি অফিস', icon: Building },
]

declare global {
    interface Window { L: any; }
}

export default function ServiceLocator() {
    const { t, language } = useLanguage();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');

    // --- Leaflet Loader Effect ---
    useEffect(() => {
        const loadLeaflet = (callback: () => void) => {
            if (window.L) { callback(); return; }
            const cssLink = document.createElement('link');
            cssLink.id = 'leaflet-css';
            cssLink.rel = 'stylesheet';
            cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(cssLink);
            const script = document.createElement('script');
            script.id = 'leaflet-js';
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            document.body.appendChild(script);
            script.onload = () => callback();
        };
        loadLeaflet(() => setMapLoaded(true));
        return () => {
            const leafletCss = document.getElementById('leaflet-css');
            const leafletJs = document.getElementById('leaflet-js');
            if (leafletCss) document.head.removeChild(leafletCss);
            if (leafletJs) document.body.removeChild(leafletJs);
        };
    }, []);

    // --- Map Initialization & Marker Updates ---
    useEffect(() => {
        if (mapLoaded && mapRef.current && !mapInstance.current) {
            const map = window.L.map(mapRef.current).setView([23.73, 90.415], 14); // Centered on Motijheel
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            mapInstance.current = map;
        }

        if (mapInstance.current) {
            mapInstance.current.eachLayer((layer: any) => {
                if (layer instanceof window.L.Marker) {
                    mapInstance.current.removeLayer(layer);
                }
            });

            const filteredLocations = serviceLocations.filter(
                loc => selectedCategory === 'all' || loc.category === selectedCategory
            );

            filteredLocations.forEach(loc => {
                const marker = window.L.marker([loc.lat, loc.lng]).addTo(mapInstance.current);
                const popupContent = `<b>${language === 'bn' ? loc.nameBn : loc.nameEn}</b>`;
                marker.bindPopup(popupContent);
            });
        }
    }, [mapLoaded, language, selectedCategory]);

    const handleFindMe = () => {
        if (navigator.geolocation && mapInstance.current) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const userLatLng = [latitude, longitude];
                
                const userIcon = new window.L.Icon({
                    iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><circle cx="12" cy="12" r="10" fill="#4285F4" stroke="#FFFFFF" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="#FFFFFF"/></svg>'),
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                    popupAnchor: [0, -16]
                });

                const marker = window.L.marker(userLatLng, { icon: userIcon }).addTo(mapInstance.current);
                marker.bindPopup(t("Your Location", "আপনার অবস্থান"));
                mapInstance.current.setView(userLatLng, 15);
            }, (error) => {
                console.error("Error getting location: ", error);
                alert(t("Could not retrieve your location.", "আপনার অবস্থান পুনরুদ্ধার করা যায়নি।"));
            });
        } else {
            alert(t("Geolocation is not supported by your browser.", "আপনার ব্রাউজার জিওলোকেশন সমর্থন করে না।"));
        }
    };

    return (
        <main className="flex-1 py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        {t("পরিষেবা কেন্দ্র", "Service Locator")}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        {t("আপনার কাছাকাছি প্রয়োজনীয় কমিউনিটি পরিষেবা এবং পাবলিক সুবিধা খুঁজুন।", "Find essential community services and public facilities near you.")}
                    </p>
                </div>
                
                <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden p-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                             {categories.map(cat => {
                                const Icon = cat.icon;
                                const isActive = selectedCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition-all ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {language === 'bn' ? cat.nameBn : cat.nameEn}
                                    </button>
                                )
                             })}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleFindMe} className="px-4 py-2 text-sm font-semibold bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-md flex items-center gap-2 transition-all">
                                <LocateFixed className="h-4 w-4" /> {t("আমাকে খুঁজুন", "Find Me")}
                            </button>
                        </div>
                    </div>
                    <div ref={mapRef} className="h-[60vh] w-full rounded-md overflow-hidden z-0">
                        {!mapLoaded && <div className="flex items-center justify-center h-full text-muted-foreground">{t("Loading Map...", "ম্যাপ লোড হচ্ছে...")}</div>}
                    </div>
                </div>
            </div>
        </main>
    );
}
