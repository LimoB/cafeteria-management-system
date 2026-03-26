import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { addMenuItem, editMenuItem, fetchMenu } from "../../../app/slices/menuSlice";
import { ArrowLeft, Upload, Save, Loader2, Info, X, Utensils, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

const AddMenu: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isEdit = Boolean(id);

  const { items, isLoading } = useAppSelector((state) => state.menu);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [formData, setFormData] = useState({
    foodName: "",
    category: "Main Dish",
    price: "",
    description: "",
  });

  useEffect(() => {
    if (isEdit) {
      if (items.length === 0) {
        dispatch(fetchMenu());
      } else {
        const item = items.find((i) => String(i.id) === String(id));
        if (item) {
          setFormData({
            foodName: item.foodName,
            category: item.category || "Main Dish",
            price: item.price.toString(),
            description: item.description || "",
          });
          setPreview(item.imageUrl || "");
        }
      }
    }
  }, [id, items, isEdit, dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Limit to 2MB
      if (selectedFile.size > 2 * 1024 * 1024) {
        toast.error("File size exceeds 2MB limit");
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append("foodName", formData.foodName);
    data.append("category", formData.category);
    data.append("price", formData.price);
    data.append("description", formData.description);
    
    if (file) {
      data.append("image", file);
    }

    const savePromise = isEdit && id
      ? dispatch(editMenuItem({ id: Number(id), formData: data })).unwrap()
      : dispatch(addMenuItem(data)).unwrap();

    toast.promise(savePromise, {
      loading: isEdit ? 'Updating record...' : 'Publishing to vault...',
      success: () => {
        navigate("/admin/menu");
        return isEdit ? 'Record updated successfully' : 'Dish published to canteen';
      },
      error: (err) => err.message || 'Operation failed'
    });
  };

  return (
    <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <button 
        onClick={() => navigate("/admin/menu")} 
        className="group flex items-center gap-3 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-black mb-10 transition-all"
      >
        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-black group-hover:text-white transition-all">
          <ArrowLeft size={14} /> 
        </div>
        Return to Inventory
      </button>

      <div className="bg-white rounded-[3rem] p-8 md:p-16 border border-gray-100 shadow-2xl shadow-gray-200/40 relative overflow-hidden">
        {/* Background Decorative Icon */}
        <div className="absolute -top-10 -right-10 opacity-[0.02] pointer-events-none rotate-12">
          <Utensils size={400} />
        </div>

        <div className="relative z-10">
          <header className="mb-12">
            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">
              {isEdit ? "Refine" : "Create"} <span className="text-red-600">Product</span>
            </h2>
            <div className="h-1 w-12 bg-red-600 mt-4 rounded-full" />
            <p className="text-gray-400 font-bold text-xs mt-6 uppercase tracking-widest">
              Administrative Control Console / Laikipia Student Center
            </p>
          </header>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Left Column: Media */}
            <div className="lg:col-span-5 space-y-6">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <ImageIcon size={12} /> Visual Asset
              </label>
              <div className="relative aspect-square rounded-[3.5rem] bg-slate-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden group hover:border-red-600/30 hover:bg-red-50/10 transition-all duration-500">
                {preview ? (
                  <>
                    <img src={preview} alt="Product" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button"
                        onClick={() => {setPreview(""); setFile(null);}}
                        className="p-4 bg-white text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-10 pointer-events-none">
                    <div className="h-24 w-24 bg-white rounded-[2rem] shadow-xl shadow-gray-100 flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform">
                      <Upload className="text-red-600" size={32} />
                    </div>
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">Select File</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Maximum 2MB Capacity</p>
                  </div>
                )}
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*" 
                />
              </div>
            </div>

            {/* Right Column: Data */}
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Identification</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Traditional Ugali & Sukuma"
                  className="w-full bg-gray-50/50 border-2 border-transparent rounded-2xl p-6 font-bold text-gray-900 focus:bg-white focus:border-red-600/20 focus:ring-0 transition-all placeholder:text-gray-300"
                  value={formData.foodName}
                  onChange={(e) => setFormData({...formData, foodName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Pricing (Ksh)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-300 text-xs">KES</span>
                    <input 
                      required
                      type="number" 
                      placeholder="0.00"
                      className="w-full bg-gray-50/50 border-2 border-transparent rounded-2xl p-6 pl-16 font-black text-gray-900 focus:bg-white focus:border-red-600/20 focus:ring-0 transition-all"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Category</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-gray-50/50 border-2 border-transparent rounded-2xl p-6 font-black text-gray-900 focus:bg-white focus:border-red-600/20 focus:ring-0 transition-all appearance-none cursor-pointer"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option>Main Dish</option>
                      <option>Snacks</option>
                      <option>Drinks</option>
                      <option>Breakfast</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                  <Info size={12} /> Specification
                </label>
                <textarea 
                  rows={4}
                  placeholder="Details regarding ingredients, allergens, or preparation..."
                  className="w-full bg-gray-50/50 border-2 border-transparent rounded-[2rem] p-6 font-bold text-gray-900 focus:bg-white focus:border-red-600/20 focus:ring-0 transition-all placeholder:text-gray-300 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-black text-white py-6 rounded-[2.5rem] font-black flex items-center justify-center gap-4 hover:bg-red-600 transition-all transform active:scale-[0.98] shadow-2xl shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} className="group-hover:scale-110 transition-transform" />
                )}
                <span className="tracking-[0.2em] uppercase text-[10px]">
                  {isEdit ? "Commit Changes" : "Sync to Live Menu"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMenu;