import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDown } from 'lucide-react';
import { cnFusion } from '@/utils/cnFusion'

interface Option {
  id: string | number;
  label: string;
  subLabel?: string;
  isSpecial?: boolean;
}

interface CustomSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CustomSelect({ options, value, onChange, placeholder = "Sélectionner...", className }: CustomSelectProps) {
  const selectedOption = options.find(opt => opt.id === value);

  return (
    <div className={cnFusion("relative w-full", className)}>
      <Listbox value={String(value)} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full p-2 text-left bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-secondary-300 sm:text-sm min-h-10.5 cursor-pointer">
            <span className={`block truncate ${!selectedOption ? 'text-slate-400' : 'text-slate-700'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400">
              <ChevronDown className="h-5 w-5" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm no-scrollbar">
              {options.map((opt) => (
                <Listbox.Option
                  key={opt.id}
                  value={opt.id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none p-2 ${
                      active ? 'bg-secondary-500 text-white' : 'text-slate-900'
                    } ${opt.isSpecial ? 'border-t mt-1' : ''}`
                  }
                >
                  <div className="flex flex-col">
                    <span className={`block truncate ${opt.isSpecial ? 'font-bold' : 'font-normal'}`}>
                      {opt.label}
                    </span>
                    {opt.subLabel && (
                      <span className={`text-xs opacity-70`}>
                        {opt.subLabel}
                      </span>
                    )}
                  </div>
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}