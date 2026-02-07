import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ModernSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select option",
  required = false,
  className = "",
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOptions = options.filter((option) => {
    const search = searchTerm.toLowerCase();

    // If option is an object with label or name
    if (typeof option === "object" && option !== null) {
      return (
        option.label?.toLowerCase().includes(search) ||
        option.name?.toLowerCase().includes(search)
      );
    }

    // If option is a string
    if (typeof option === "string") {
      return option.toLowerCase().includes(search);
    }

    return false;
  });

  const selectedOption = options.find(
    (option) => (option.value || option) === value,
  );

  const displayText = selectedOption
    ? selectedOption.label || selectedOption.name || selectedOption
    : placeholder;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    const optionValue = option.value || option;
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`w-full px-4 py-2 rounded-md border outline-none cursor-pointer text-sm flex items-center justify-between transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        style={{
          backgroundColor: colors.background,
          borderColor: isOpen ? colors.primary : colors.accent + "30",
          color: value ? colors.text : colors.textSecondary,
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          style={{ color: colors.textSecondary }}
        />
      </div>

      {isOpen && (
        <div
          className="absolute z-999 w-full mt-1 rounded-xl border shadow-2xl overflow-hidden"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.accent + "30",
            top: "100%",
            left: 0,
          }}
        >
          {options.length > 5 && (
            <div
              className="p-2 border-b"
              style={{ borderColor: colors.accent + "20" }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1 text-sm rounded border outline-none"
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                  borderColor: colors.accent + "30",
                  color: colors.text,
                }}
                autoFocus
              />
            </div>
          )}

          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div
                className="px-4 py-3 text-sm text-center"
                style={{ color: colors.textSecondary }}
              >
                No options found
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = option.value || option;
                const optionLabel = option.label || option.name || option;
                const isSelected = optionValue === value;

                return (
                  <div
                    key={index}
                    className="px-4 py-2 cursor-pointer text-sm flex items-center justify-between transition-colors"
                    style={{
                      backgroundColor: isSelected
                        ? colors.primary + "10"
                        : "transparent",
                      color: isSelected ? colors.primary : colors.text,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.target.style.backgroundColor = colors.accent + "10";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.target.style.backgroundColor = "transparent";
                      }
                    }}
                    onClick={() => handleSelect(option)}
                  >
                    <span className="truncate">{optionLabel}</span>
                    {isSelected && (
                      <Check size={16} style={{ color: colors.primary }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernSelect;
