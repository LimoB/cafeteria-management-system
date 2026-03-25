import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { submitCustomOrder, fetchCustomOrders } from '../../../app/slices/customOrderSlice'; // Ensure fetchUserCustomOrders exists
import { fetchLocations } from '../../../app/slices/locationSlice';
import { 
  UtensilsCrossed, Send, Info, MessageSquareQuote, 
  MapPin, ChevronDown, Clock, CheckCircle2, XCircle, AlertCircle 
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import { CustomOrderRequest } from '../../../types/customOrder.types';
import { formatDate } from '../../../utils/dateFormatter';

const RequestFood: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Slices
  const { customOrders, isLoading, message, isError } = useAppSelector((state) => state.customOrders);
  const { locations } = useAppSelector((state) => state.locations);
  const { user } = useAppSelector((state) => state.auth);
  
  // Local State
  const [description, setDescription] = useState('');
  const [baseMeal, setBaseMeal] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  useEffect(() => {
    dispatch(fetchLocations());
    dispatch(fetchCustomOrders()); // Fetch existing requests on mount
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !selectedLocation) {
      alert("Please describe your request and select a location.");
      return;
    }

    const locationName = locations.find(l => String(l.id) === selectedLocation)?.name || "Main Canteen";

    const requestData: CustomOrderRequest = {
        description: baseMeal ? `[${baseMeal.toUpperCase()}] ${description}` : description,
        takeawayLocation: locationName,
        requestDate: ''
    };

    const resultAction = await dispatch(submitCustomOrder(requestData));
    
    if (submitCustomOrder.fulfilled.match(resultAction)) {
      setDescription('');
      setBaseMeal('');
      setSelectedLocation('');
      dispatch(fetchCustomOrders()); // Refresh list
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return { bg: 'bg-green-50', text: 'text-green-600', icon: <CheckCircle2 size={12} /> };
      case 'rejected': return { bg: 'bg-red-50', text: 'text-red-600', icon: <XCircle size={12} /> };
      default: return { bg: 'bg-amber-50', text: 'text-amber-600', icon: <Clock size={12} /> };
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 pb-24">
      <header className="mb-10">
        <h1 className="text-4xl font-black uppercase italic text-gray-900 tracking-tighter">
          Custom <span className="text-red-600">Request</span>
        </h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">
          Special dietary needs or off-menu cravings
        </p>
      </header>

      {/* Form Section */}
      <div className="bg-white border-2 border-black rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-16">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2 text-gray-400">Base Meal (Optional)</label>
            <input 
              type="text"
              placeholder="e.g., Pilau, Ugali Matumbo..."
              value={baseMeal}
              onChange={(e) => setBaseMeal(e.target.value)}
              className="w-full p-4 border-2 border-black rounded-2xl outline-none focus:ring-4 focus:ring-red-100 font-bold"
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-black uppercase tracking-widest mb-2 text-gray-400 flex items-center gap-1">
              <MapPin size={12} className="text-red-600" /> Pickup Window
            </label>
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-4 border-2 border-black rounded-2xl outline-none appearance-none bg-gray-50 cursor-pointer font-bold"
            >
              <option value="">Select a window...</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 bottom-4 text-gray-400 pointer-events-none" size={20} />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2 text-gray-400">Instructions</label>
            <textarea 
              rows={4}
              placeholder="Describe exactly how you want your meal prepared..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 border-2 border-black rounded-2xl outline-none focus:ring-4 focus:ring-red-100 font-medium text-sm"
            />
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl flex gap-3">
            <Info size={20} className="text-blue-500 shrink-0" />
            <p className="text-[11px] text-blue-700 font-black uppercase">
              Staff will review and reply with a price quote.
            </p>
          </div>

          <Button type="submit" className="w-full py-5 flex items-center justify-center gap-2" isLoading={isLoading}>
            <Send size={18} /> Submit for Review
          </Button>
        </form>
      </div>

      {/* Recent Requests Section */}
      <div className="mt-12">
        <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2 italic">
          <MessageSquareQuote size={24} className="text-red-600" /> Recent <span className="text-red-600">Requests</span>
        </h3>
        
        {customOrders.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-[2rem] bg-gray-50/50">
            <UtensilsCrossed size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">No requests found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {customOrders.map((order) => {
              const statusStyle = getStatusStyle(order.approvalStatus);
              return (
                <div key={order.id} className="bg-white border-2 border-black rounded-3xl p-5 hover:translate-x-1 hover:-translate-y-1 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <Clock size={12} /> {formatDate(order.createdAt)}
                    </span>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-black ${statusStyle.bg} ${statusStyle.text} text-[9px] font-black uppercase`}>
                      {statusStyle.icon} {order.approvalStatus}
                    </div>
                  </div>
                  
                  <p className="text-sm font-bold text-gray-900 mb-4 leading-relaxed">
                    {order.description}
                  </p>

                  <div className="flex items-center justify-between border-t-2 border-black pt-4">
                    <span className="text-[9px] font-black uppercase text-gray-500 flex items-center gap-1">
                      <MapPin size={10} className="text-red-600" /> {order.takeawayLocation}
                    </span>
                    {order.approvalStatus === 'approved' && (
                       <span className="text-xs font-black text-red-600 underline">Check Notifications for Price</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestFood;