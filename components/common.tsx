
import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Notification as NotificationType } from '../types';
import { useAppContext } from '../context/AppContext';

// Type assertion for qrcode.js library from CDN
declare const QRCode: any;

export const Icon: React.FC<{ name: string; className?: string }> = ({ name, className }) => (
  <i data-lucide={name} className={className}></i>
);

export const Button: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string; type?: 'button' | 'submit' | 'reset'; to?: string, disabled?: boolean }> = ({ children, onClick, className, type = 'button', to, disabled }) => {
  const baseClasses = "group relative inline-flex items-center justify-center px-6 py-3 font-bold text-white rounded-lg shadow-elevation-2 overflow-hidden focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-transform transform duration-300 ease-in-out";
  const themeClasses = "bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 bg-[length:200%_auto] hover:bg-[position:100%_0] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100";
  
  const content = <span className="relative z-10">{children}</span>;

  if (to) {
    return (
      <Link to={to} className={`${baseClasses} ${themeClasses} ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={`${baseClasses} ${themeClasses} ${className}`} disabled={disabled}>
      {content}
    </button>
  );
};

export const SecondaryButton: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string; to?: string }> = ({ children, onClick, className, to }) => {
    const classes = "relative inline-block p-[2px] font-bold rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 transition-all duration-300 hover:shadow-glow-indigo";
    const innerClasses = "flex items-center justify-center bg-slate-800 text-white px-5 py-2.5 rounded-[10px] hover:bg-slate-900/80 transition-colors";
    
    if (to) {
      return <Link to={to} className={`${classes} ${className}`}><span className={innerClasses}>{children}</span></Link>
    }
    return <button onClick={onClick} className={`${classes} ${className}`}><span className={innerClasses}>{children}</span></button>;
};

export const CountdownTimer: React.FC<{ expiryDate: string }> = ({ expiryDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(expiryDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft);
    }, 1000 * 60); // update every minute

    return () => clearInterval(timer);
  }, [expiryDate]);

  const timerComponents: any[] = [];
  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval as keyof typeof timeLeft]) {
      return;
    }
    timerComponents.push(
      <span key={interval}>
        {timeLeft[interval as keyof typeof timeLeft]}{interval.charAt(0)}{" "}
      </span>
    );
  });

  return (
    <div className="text-sm text-amber-400 font-semibold">
      <Icon name="clock" className="w-4 h-4 inline-block mr-1.5" />
      {timerComponents.length ? <>{timerComponents} left</> : <span>Expired</span>}
    </div>
  );
};

export const QRCodeCanvas: React.FC<{ text: string }> = ({ text }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && typeof QRCode !== 'undefined') {
      QRCode.toCanvas(canvasRef.current, text, { width: 256, margin: 2, color: { dark: '#0f172a', light: '#FFFFFF' } }, (error: any) => {
        if (error) console.error("QRCode generation error:", error);
      });
    }
  }, [text]);

  return <canvas ref={canvasRef} className="rounded-lg" />;
};


export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex justify-center items-center backdrop-blur-sm" onClick={onClose}>
            <div className="bg-slate-800/80 rounded-2xl shadow-elevation-3 shadow-indigo-500/20 p-8 w-full max-w-md relative animate-fade-in border border-slate-700" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <Icon name="x" className="w-6 h-6" />
                </button>
                <h2 className="text-3xl font-bold font-display mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{title}</h2>
                {children}
            </div>
        </div>
    );
};

export const Notification: React.FC<{ notification: NotificationType }> = ({ notification }) => {
    const { removeNotification } = useAppContext();

    const iconName = {
        success: 'check-circle-2', info: 'info', error: 'alert-circle'
    }[notification.type];
    
    const borderColor = {
        success: 'border-emerald-500/50', info: 'border-blue-500/50', error: 'border-red-500/50'
    }[notification.type];

    const iconColor = {
        success: 'text-emerald-400', info: 'text-blue-400', error: 'text-red-400'
    }[notification.type];

    return (
        <div className={`flex items-center p-4 mb-4 text-white rounded-xl shadow-lg bg-slate-800/80 border ${borderColor} backdrop-blur-md animate-fade-in`}>
            <Icon name={iconName} className={`w-6 h-6 mr-3 ${iconColor}`} />
            <span className="flex-1 text-sm font-medium">{notification.message}</span>
            <button onClick={() => removeNotification(notification.id)} className="ml-4 -mr-1 p-1.5 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50">
                <Icon name="x" className="w-4 h-4" />
            </button>
        </div>
    );
};

export const NotificationContainer: React.FC = () => {
    const { notifications } = useAppContext();
    
    return (
        <div className="fixed top-24 right-4 z-[100] w-full max-w-sm">
            {notifications.map(n => <Notification key={n.id} notification={n} />)}
        </div>
    )
};

// Form Field Components
const formClasses = "block w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg placeholder-slate-500 text-white transition-colors duration-300 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20";

export const InputField: React.FC<any> = ({ name, label, ...props }) => (
    <div className="relative">
        <input id={name} name={name} {...props} className={`${formClasses} peer`} placeholder=" "/>
        <label htmlFor={name} className="absolute left-4 -top-2.5 bg-slate-800 px-1 text-sm text-slate-400 transition-all duration-300 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-400">{label}</label>
    </div>
);
export const TextAreaField: React.FC<any> = ({ name, label, ...props }) => (
    <div className="relative">
        <textarea id={name} name={name} {...props} className={`${formClasses} peer pt-4`} placeholder=" "/>
        <label htmlFor={name} className="absolute left-4 -top-2.5 bg-slate-800 px-1 text-sm text-slate-400 transition-all duration-300 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-400">{label}</label>
    </div>
);
export const SelectField: React.FC<any> = ({ name, label, options, ...props }) => (
    <div className="relative">
        <select id={name} name={name} {...props} className={formClasses}>
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
         <label htmlFor={name} className="absolute left-4 -top-2.5 bg-slate-800 px-1 text-sm text-slate-400">{label}</label>
    </div>
);
