import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { 
  fetchMenu, 
  removeMenuItem, 
  editMenuItem 
} from '../../../app/slices/menuSlice';
import { Trash2, Edit, Plus, Loader2, Utensils, CheckCircle2, XCircle, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MenuList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, isLoading } = useAppSelector((state) => state.menu);
  
  // Local state to prevent multiple clicks during async toggles
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchMenu());
  }, [dispatch]);

  const handleDelete = async (id: number, name: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${name}"?`);
    
    if (confirmDelete) {
      const deletePromise = dispatch(removeMenuItem(id)).unwrap();
      
      toast.promise(deletePromise, {
        loading: `Removing ${name}...`,
        success: <b>{name} removed from vault.</b>,
        error: <b>Could not delete item. Try again.</b>,
      });
    }
  };

  const handleToggleAvailability = async (id: number, currentStatus: boolean, name: string) => {
    setUpdatingId(id);
    const newStatus = !currentStatus;
    
    try {
      const formData = new FormData();
      formData.append("isAvailable", String(newStatus));
      
      await dispatch(editMenuItem({ id, formData })).unwrap();
      
      toast.success(
        `${name} is now ${newStatus ? 'Available' : 'Out of Stock'}`,
        {
          icon: newStatus ? '✅' : '🛑',
          style: {
            borderRadius: '12px',
            background: '#333',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold'
          },
        }
      );
    } catch (err) {
      toast.error(`Failed to update ${name}`);
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className="animate-spin text-red-600" size={48} />
        <Utensils className="absolute inset-0 m-auto text-gray-300" size={16} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Syncing Canteen Vault...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
            Menu <span className="text-red-600">Vault</span>
          </h1>
          <p className="text-gray-500 font-bold text-xs mt-1 uppercase tracking-wider">
            Laikipia Student Center <span className="mx-2 text-gray-300">|</span> 
            <span className="text-emerald-600">{items.length} Items Live</span>
          </p>
        </div>
        <Link 
          to="/admin/menu/add" 
          className="group flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-2xl shadow-gray-200 active:scale-95"
        >
          <Plus size={18} className="text-red-500 group-hover:text-white transition-colors" /> 
          Add New Dish
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-6 pl-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Dish Details</th>
                <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Category</th>
                <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Status</th>
                <th className="py-6 pr-8 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-5 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 overflow-hidden border border-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.foodName} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Utensils size={20} />
                            </div>
                          )}
                        </div>
                        <span className="font-black text-gray-900 text-sm tracking-tight">{item.foodName}</span>
                      </div>
                    </td>
                    <td className="py-5 text-center">
                      <span className="text-[9px] font-black text-gray-400 bg-white border border-gray-200 px-3 py-1 rounded-full uppercase">
                        {item.category || 'Main'}
                      </span>
                    </td>
                    <td className="py-5">
                      <span className="font-black text-gray-900 text-sm">Ksh {item.price}</span>
                    </td>
                    <td className="py-5">
                      <button 
                        disabled={updatingId === item.id}
                        onClick={() => handleToggleAvailability(item.id, item.isAvailable, item.foodName)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${
                          updatingId === item.id ? "opacity-50 cursor-not-allowed" : ""
                        } ${
                          item.isAvailable 
                            ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100" 
                            : "bg-red-50 border-red-100 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        {updatingId === item.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : item.isAvailable ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <XCircle size={14} />
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {item.isAvailable ? 'Available' : 'Sold Out'}
                        </span>
                      </button>
                    </td>
                    <td className="py-5 pr-8 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/admin/menu/edit/${item.id}`)}
                          className="p-3 text-slate-400 hover:text-black hover:bg-gray-100 rounded-xl transition-all"
                          title="Edit Item"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id, item.foodName)}
                          className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <Search size={40} />
                      <p className="font-black uppercase tracking-widest text-xs">No dishes found in vault</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MenuList;