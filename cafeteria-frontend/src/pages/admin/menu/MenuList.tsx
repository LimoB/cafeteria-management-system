import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { 
  fetchMenu, 
  removeMenuItem, 
  editMenuItem // Assuming your slice handles partial updates via editMenuItem
} from '../../../app/slices/menuSlice';
import { Trash2, Edit, Plus, Loader2, Utensils, CheckCircle2, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MenuList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, isLoading } = useAppSelector((state) => state.menu);

  useEffect(() => {
    dispatch(fetchMenu());
  }, [dispatch]);

  const handleDelete = (id: number) => {
    if (window.confirm("Confirm deletion? This will remove the item from all student menus.")) {
      dispatch(removeMenuItem(id));
    }
  };

  const handleToggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      // We send a FormData or Object depending on your editMenuItem implementation
      // Here we assume it accepts an ID and the data to change
      const formData = new FormData();
      formData.append("isAvailable", String(!currentStatus));
      
      await dispatch(editMenuItem({ id, formData })).unwrap();
      toast.success(`Item marked as ${!currentStatus ? 'Available' : 'Out of Stock'}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-red-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Canteen Menu...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">
            Menu <span className="text-red-600">Vault</span>
          </h1>
          <p className="text-gray-500 font-bold text-sm">Real-time stock control for Laikipia Student Center.</p>
        </div>
        <Link 
          to="/admin/menu/add" 
          className="flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-gray-200 active:scale-95"
        >
          <Plus size={18} className="text-red-500" /> Add New Dish
        </Link>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="py-6 pl-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Dish Details</th>
                <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Status</th>
                <th className="py-6 pr-8 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Control Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-5 pl-8">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-slate-100 overflow-hidden border border-gray-100 flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Utensils size={20} />
                          </div>
                        )}
                      </div>
                      <span className="font-black text-gray-900 text-sm tracking-tight">{item.foodName}</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg uppercase">
                      {item.category || 'Main'}
                    </span>
                  </td>
                  <td className="py-5">
                    <span className="font-black text-gray-900 text-sm">Ksh {item.price}</span>
                  </td>
                  <td className="py-5">
                    <button 
                      onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${
                        item.isAvailable 
                          ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100" 
                          : "bg-red-50 border-red-100 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      {item.isAvailable ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Available</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Sold Out</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-5 pr-8 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/admin/menu/edit/${item.id}`)}
                        className="p-3 text-slate-400 hover:text-white hover:bg-black rounded-xl border border-slate-100 hover:border-black shadow-sm transition-all"
                        title="Edit Item"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-3 text-slate-400 hover:text-white hover:bg-red-600 rounded-xl border border-slate-100 hover:border-red-600 shadow-sm transition-all"
                        title="Delete Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MenuList;