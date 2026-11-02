import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import { useUser } from './UserContext.jsx';

const HotelContext = createContext();

// Resilient Offline Local Seed Data in case Node.js MVC Server is not running
const offlineRooms = [
  {
    _id: "off_r1",
    name: "Suite with Jacuzzi (Offline Mode)",
    type: "Suite",
    description: "Our premier signature suite, featuring a private heated jacuzzi tub, spacious living area, and premium 24/7 butler service.",
    price: 650,
    rating: 4.9,
    image: "/images/room_royal_suite.jpg",
    maxGuests: 4,
    features: ["Private Jacuzzi", "Sea View", "24/7 Butler", "King Bed"],
    available: true,
    bookings: []
  },
  {
    _id: "off_r2",
    name: "Luxurious Suite without Jacuzzi (Offline Mode)",
    type: "Suite",
    description: "An exceptionally spacious and luxurious suite decorated with bespoke furniture, featuring a separate living salon and panoramic views.",
    price: 450,
    rating: 4.8,
    image: "/images/room_presidential_suite.jpg",
    maxGuests: 4,
    features: ["Ocean View", "Spacious Salon", "VIP Access", "King Bed"],
    available: true,
    bookings: []
  },
  {
    _id: "off_r3",
    name: "Standard Garden View (Offline Mode)",
    type: "Room",
    description: "Charming standard guest room offering peaceful views of our lush landscaped hotel gardens, complete with a private terrace or balcony.",
    price: 180,
    rating: 4.5,
    image: "/images/room_skanes_garden.jpg",
    maxGuests: 2,
    features: ["Garden View", "Terrace/Balcony", "Free Wi-Fi", "King Bed"],
    available: true,
    bookings: []
  },
  {
    _id: "off_r4",
    name: "Standard Pool View (Offline Mode)",
    type: "Room",
    description: "Elegant standard guest room featuring a private balcony with direct, scenic views of the central swimming pool.",
    price: 220,
    rating: 4.6,
    image: "/images/room_executive_sea.jpg",
    maxGuests: 2,
    features: ["Pool View", "Private Balcony", "Free Wi-Fi", "Double Bed"],
    available: true,
    bookings: []
  },
  {
    _id: "off_r5",
    name: "Standard Garden View Piscine (Offline Mode)",
    type: "Room",
    description: "Comfortable guest room perfectly positioned to offer views of both our serene gardens and the central swimming pool.",
    price: 250,
    rating: 4.7,
    image: "/images/room_royal_suite.jpg",
    maxGuests: 2,
    features: ["Garden & Pool View", "Private Balcony", "Hammam Shower", "King Bed"],
    available: true,
    bookings: []
  }
];

const offlineDining = [
  {
    _id: "off_d1",
    name: "La Voile (Offline)",
    cuisine: "Mediterranean & Seafood A La Carte",
    description: "Direct beachfront dining offering freshly caught Mediterranean fish, grilled specialties, and premium wines right by the surf.",
    image: "/images/restaurant_la_voile.jpg",
    tables: [
      { id: 101, label: "VIP Sea Window (2 Guest Limit)", size: 2, bookedSlots: [] },
      { id: 102, label: "Sea Terrace Alcove (4 Guest Limit)", size: 4, bookedSlots: [] }
    ]
  }
];

const offlineEvents = [
  {
    _id: "off_e1",
    name: "Mediterranean Summer Gala (Offline)",
    type: "Event",
    category: "Galas & Dining",
    description: "An exclusive beachfront gala evening under the stars featuring world-class live musicians, gourmet Tunisian seafood pairings, and a grand fireworks show.",
      date: "2027-06-15",
    time: "20:00 - Midnight",
    capacity: 150,
    registered: ["Sophia Loren"],
    image: "/images/event_gala.jpg"
  },
  {
    _id: "off_e2",
    name: "Thalasso Wellness Summit (Offline)",
    type: "Event",
    category: "Wellness Conferences",
    description: "A weekend of marine therapy, holistic health, and mindful coastal living.",
    date: "2027-07-02",
    time: "09:00 - 18:00",
    price: 90,
    capacity: 80,
    registered: [],
    image: "/images/event_summit.jpg"
  }
];

const offlineActivities = [
  {
    _id: "off_a1",
    name: "Royal Elyssa Thalasso & Spa (Offline)",
    type: "Activity",
    category: "Thalassotherapy & Wellness",
    description: "Rejuvenating thalassotherapy treatments, marine hydrotherapy seawater pools, and luxury multi-sensory hammams in our world-renowned wellness center.",
    date: "Daily",
    time: "09:00 - 20:00",
    price: 75,
    capacity: 15,
    registered: ["Sophia Loren"],
    image: "/images/activity_spa.jpg"
  }
];

const offlineReviews = [
  {
    _id: "off_rv1",
    guestName: "Elena Rostova",
    rating: 5,
    category: "Service",
    comment: "The butler service in the Royal Ocean Suite was absolutely flawless. They anticipated every single need we had during our anniversary stay!",
    date: "2026-05-20"
  }
];

const offlineReclamations = [
  {
    _id: "off_rec1",
    guestName: "Sophia Loren",
    roomNumber: "Suite 304",
    category: "Maintenance",
    urgency: "Medium",
    description: "The private balcony hot tub heater is not reaching the requested 38°C temperature.",
    status: "In Progress",
    date: "2026-05-26",
    response: "Maintenance team dispatched. Heating element being replaced."
  }
];

export const HotelProvider = ({ children }) => {
  const { user } = useUser();
  const [rooms, setRooms] = useState(offlineRooms);
  const [dining, setDining] = useState(offlineDining);
  const [events, setEvents] = useState(offlineEvents);
  const [activities, setActivities] = useState(offlineActivities);
  const [reviews, setReviews] = useState(offlineReviews);
  const [reclamations, setReclamations] = useState(offlineReclamations);
  
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Core Sync Driver: Pulls all database entries from MVC Server
  const loadDatabase = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Rooms catalog
      const roomRes = await api.getRooms();
      setRooms(roomRes.data || []);
      // 2. Fetch Dining layout
      const diningRes = await api.getDining();
      setDining(diningRes.data || []);

      // 3. Fetch Events & activities
      const eventRes = await api.getEvents();
      setEvents((eventRes.data || []).filter(e => e.type === 'Event'));
      setActivities((eventRes.data || []).filter(e => e.type === 'Activity'));

      // 4. Fetch Public Reviews
      const reviewRes = await api.getReviews();
      setReviews(reviewRes.data || []);

      if (user) {
        const recRes = await api.getReclamations();
        setReclamations(recRes.reclamations || []);
      } else {
        setReclamations([]);
      }

      setIsOfflineMode(false);
    } catch {
      console.warn('⚠️  Could not connect to MVC API Server. Defaulting to local offline states.');
      setIsOfflineMode(true);
      
      // Load offline states from localStorage if available, otherwise use seeds
      const localRooms = localStorage.getItem('rt_off_rooms');
      const localDining = localStorage.getItem('rt_off_dining');
      const localEvents = localStorage.getItem('rt_off_events');
      const localAct = localStorage.getItem('rt_off_activities');
      const localReviews = localStorage.getItem('rt_off_reviews');
      const localRec = localStorage.getItem('rt_off_reclamations');

      if (localRooms) setRooms(JSON.parse(localRooms));
      if (localDining) setDining(JSON.parse(localDining));
      if (localEvents) setEvents(JSON.parse(localEvents));
      if (localAct) setActivities(JSON.parse(localAct));
      if (localReviews) setReviews(JSON.parse(localReviews));
      if (localRec) setReclamations(JSON.parse(localRec));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    Promise.resolve().then(loadDatabase);
  }, [loadDatabase]);

  // Update offline localStorage whenever states change in offline mode
  useEffect(() => {
    if (isOfflineMode) {
      localStorage.setItem('rt_off_rooms', JSON.stringify(rooms));
      localStorage.setItem('rt_off_dining', JSON.stringify(dining));
      localStorage.setItem('rt_off_events', JSON.stringify(events));
      localStorage.setItem('rt_off_activities', JSON.stringify(activities));
      localStorage.setItem('rt_off_reviews', JSON.stringify(reviews));
      localStorage.setItem('rt_off_reclamations', JSON.stringify(reclamations));
    }
  }, [rooms, dining, events, activities, reviews, reclamations, isOfflineMode]);


  /* MUTATING ACTIONS */

  // Book a luxury Room stay
  const bookRoom = async (roomId, checkIn, checkOut, guestName, guestsCount, totalAmount, addons = []) => {
    if (isOfflineMode) {
      const newB = { id: Date.now(), guestName, checkIn, checkOut, guestsCount: parseInt(guestsCount), totalAmount, addons };
      setRooms(prev => prev.map(r => (r._id || r.id) === roomId ? { ...r, bookings: [...(r.bookings || []), newB] } : r));
      return { message: 'Booking logged (offline)', booking: newB };
    }
    
    const res = await api.createBooking({ roomId, checkIn, checkOut, guestsCount, totalAmount, addons });
    await loadDatabase();
    return res;
  };

  // Reserve a dining table
  const bookTable = async (restaurantId, tableId, date, time, guestName, partySize) => {
    if (isOfflineMode) {
      setDining(prev => prev.map(rest => {
        if (rest._id === restaurantId) {
          return {
            ...rest,
            tables: rest.tables.map(table => {
              if (table.id === tableId) {
                return {
                  ...table,
                  bookedSlots: [...table.bookedSlots, { date, time, guestName, partySize }]
                };
              }
              return table;
            })
          };
        }
        return rest;
      }));
      return { message: 'Table reserved (offline)' };
    }

    const res = await api.reserveTable({ restaurantId, tableId, date, time, partySize });
    await loadDatabase();
    return res;
  };

  // Register for resort activities
  const registerForActivity = async (activityId, guestName) => {
    if (isOfflineMode) {
      setActivities(prev => prev.map(a => {
        if (a._id === activityId) {
          return a.registered.includes(guestName) ? a : { ...a, registered: [...a.registered, guestName] };
        }
        return a;
      }));
      return { message: 'Activity registered (offline)' };
    }

    const res = await api.registerForEvent(activityId);
    await loadDatabase();
    return res;
  };

  // Register for Special Event
  const registerForEvent = async (eventId, guestName) => {
    if (isOfflineMode) {
      setEvents(prev => prev.map(e => {
        if (e._id === eventId) {
          return e.registered.includes(guestName) ? e : { ...e, registered: [...e.registered, guestName] };
        }
        return e;
      }));
      return { message: 'Event registered (offline)' };
    }

    const res = await api.registerForEvent(eventId);
    await loadDatabase();
    return res;
  };

  // Add Public review
  const addReview = async (guestName, rating, category, comment) => {
    if (isOfflineMode) {
      const newR = { _id: Date.now().toString(), guestName, rating, category, comment, date: new Date().toISOString().split('T')[0] };
      setReviews(prev => [newR, ...prev]);
      return { message: 'Review added (offline)' };
    }

    const res = await api.addReview({ rating, category, comment });
    await loadDatabase();
    return res;
  };

  // Lodge complaint reclamation
  const addReclamation = async (guestName, roomNumber, category, urgency, description) => {
    if (isOfflineMode) {
      const newT = { _id: Date.now().toString(), guestName, roomNumber, category, urgency, description, status: 'Pending', date: new Date().toISOString().split('T')[0], response: '' };
      setReclamations(prev => [newT, ...prev]);
      return { message: 'Ticket logged (offline)' };
    }

    const res = await api.addReclamation({ roomNumber, category, urgency, description });
    await loadDatabase();
    return res;
  };


  /* ADMIN LEVEL WORKFLOWS */

  // Toggle Room Service Status
  const toggleRoomAvailability = async (roomId) => {
    if (isOfflineMode) {
      setRooms(prev => prev.map(r => r._id === roomId ? { ...r, available: !r.available } : r));
      return;
    }
    await api.toggleRoomAvailability(roomId);
    await loadDatabase();
  };

  // Modify Room rate dynamically
  const updateRoomPrice = async (roomId, newPrice) => {
    if (isOfflineMode) {
      setRooms(prev => prev.map(r => r._id === roomId ? { ...r, price: parseFloat(newPrice) } : r));
      return;
    }
    await api.updateRoomPrice(roomId, newPrice);
    await loadDatabase();
  };

  // Resolve complaint ticket with admin note
  const resolveReclamation = async (reclamationId, adminResponse) => {
    if (isOfflineMode) {
      setReclamations(prev => prev.map(t => t._id === reclamationId ? { ...t, status: 'Resolved', response: adminResponse } : t));
      return;
    }
    await api.resolveReclamation(reclamationId, 'Resolved', adminResponse);
    await loadDatabase();
  };

  // Adjust Complaint ticket states
  const updateReclamationStatus = async (reclamationId, nextStatus) => {
    if (isOfflineMode) {
      setReclamations(prev => prev.map(t => t._id === reclamationId ? { ...t, status: nextStatus } : t));
      return;
    }
    await api.resolveReclamation(reclamationId, nextStatus, undefined);
    await loadDatabase();
  };

  // Schedule brand new luxury events
  const addNewEvent = async (eventData) => {
    if (isOfflineMode) {
      const newE = { _id: Date.now().toString(), registered: [], ...eventData };
      if (eventData.type === 'Event') {
        setEvents(prev => [newE, ...prev]);
      } else {
        setActivities(prev => [newE, ...prev]);
      }
      return;
    }
    await api.createEvent(eventData);
    await loadDatabase();
  };


  /* BUSINESS PERFORMANCE METRICS */
  const getStats = () => {
    const totalBookings = rooms.reduce((acc, room) => acc + (room.bookings ? room.bookings.filter((booking) => booking.status !== 'Cancelled').length : 0), 0);
    const activeRoomsBooked = rooms.filter(room => room.bookings && room.bookings.some((booking) => booking.status !== 'Cancelled')).length;
    const roomOccupancyRate = rooms.length > 0 ? Math.round((activeRoomsBooked / rooms.length) * 100) : 0;

    const totalRestaurantBookings = dining.reduce((acc, rest) => {
      return acc + rest.tables.reduce((tAcc, t) => tAcc + (t.bookedSlots ? t.bookedSlots.length : 0), 0);
    }, 0);

    const avgReviewScore = reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : 5.0;

    const totalRevenue = rooms.reduce((acc, room) => {
      return acc + (room.bookings ? room.bookings.filter((booking) => booking.status !== 'Cancelled').reduce((bAcc, b) => bAcc + Number(b.totalAmount ?? b.total ?? 0), 0) : 0);
    }, 0);

    const pendingTickets = reclamations.filter(t => t.status === 'Pending').length;
    const activeComplaintsCount = reclamations.filter(t => t.status !== 'Resolved').length;

    return {
      totalBookings,
      roomOccupancyRate,
      totalRestaurantBookings,
      avgReviewScore,
      totalRevenue,
      pendingTickets,
      activeComplaintsCount
    };
  };

  return (
    <HotelContext.Provider value={{
      rooms,
      dining,
      events,
      activities,
      reviews,
      reclamations,
      loading,
      isOfflineMode,
      bookRoom,
      bookTable,
      registerForActivity,
      registerForEvent,
      addReview,
      addReclamation,
      toggleRoomAvailability,
      updateRoomPrice,
      resolveReclamation,
      updateReclamationStatus,
      addNewEvent,
      stats: getStats(),
      refresh: loadDatabase
    }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
