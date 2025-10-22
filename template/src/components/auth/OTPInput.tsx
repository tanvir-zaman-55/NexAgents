import { useRef, useState, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
}

export function OTPInput({ length = 6, onComplete, disabled = false }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;

    // Only allow digits
    const sanitizedValue = value.replace(/[^0-9]/g, "");

    if (sanitizedValue.length > 1) {
      // Handle paste into a single input
      handlePaste(sanitizedValue, index);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = sanitizedValue;
    setOtp(newOtp);

    // Auto-focus next input
    if (sanitizedValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete if all digits are filled
    if (newOtp.every((digit) => digit !== "") && sanitizedValue) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (pastedData: string, startIndex: number = 0) => {
    if (disabled) return;

    // Extract only digits from pasted data
    const digits = pastedData.replace(/[^0-9]/g, "").split("");
    const newOtp = [...otp];

    // Fill inputs with pasted digits
    digits.forEach((digit, i) => {
      const index = startIndex + i;
      if (index < length) {
        newOtp[index] = digit;
      }
    });

    setOtp(newOtp);

    // Focus last filled input
    const lastFilledIndex = Math.min(startIndex + digits.length - 1, length - 1);
    inputRefs.current[lastFilledIndex]?.focus();

    // Call onComplete if all digits are filled
    if (newOtp.every((digit) => digit !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  const handlePasteEvent = (e: ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    handlePaste(pastedData, index);
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
          onPaste={(e: ClipboardEvent<HTMLInputElement>) => handlePasteEvent(e, index)}
          disabled={disabled}
          className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
}
