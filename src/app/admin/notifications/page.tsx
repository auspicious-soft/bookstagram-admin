"use client" 
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import Select, { StylesConfig } from 'react-select'
import CustomSelect from '@/app/components/CustomSelect';
import UseUsers from '@/utils/useUsers';

const Page = () => {
  const [activeTab, setActiveTab] = useState<'notification' | 'newsletter'>('notification');
  const [sendToSpecific, setSendToSpecific] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '' });
  const [isPending, startTranstion] = useTransition()
  const {users} = UseUsers();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  }

  const [selectedOptions, setSelectedOptions] = useState<any>([]);

  const handleSelectChange = (selected: any) => {
    setSelectedOptions(selected)
  }
  const handleSubmit = async () => {
 
  }

  return (
    <form>
      <div className='main-form bg-white p-[30px] rounded-[20px] '>
        <div className="space-y-5">
        <label>Enter Title
          <input
            type="text"
            required
            name="title"
            placeholder="Enter title"
            value={formData.title}
            onChange={handleChange}
          />
          </label>
          <label>Description
          <textarea
            name="message"
            required
            placeholder="Enter message!"
            rows={4}
            value={formData.message}
            onChange={handleChange}
          ></textarea>
          </label>

          <label className="custom-checkbox ">
            <input
              type="checkbox"
              checked={sendToSpecific}
              onChange={() => setSendToSpecific(!sendToSpecific)}
              className="!w-auto"
            />
            <span className='pl-2 text-[#686C78] text-base leading-7 '> Send to a specific person</span>
          </label>
          {sendToSpecific && (
            <div>
              <CustomSelect name='Select People' value={selectedOptions} onChange={handleSelectChange} required options={users} isMulti={true} />
            </div>
          )}
        </div>

      <div className='flex justify-end mt-10  '>
        <button
          type='submit'
          disabled={isPending}
          onClick={handleSubmit}
          className="bg-orange text-white text-sm px-4 py-[14px] text-center rounded-[28px] w-full"
        >
          {!isPending ? 'Send' : 'Sending...'}
        </button>
      </div>
      </div>
    </form>
  )
};

export default Page;
