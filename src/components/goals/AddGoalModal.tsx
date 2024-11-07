import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../shared/Button';
import { FormLabel, Select, Input } from '../shared/FormStyles';
import CurrencyInput from '../shared/CurrencyInput';
import DatePicker from '../shared/DatePicker';
import { Goal } from '../../types';
import { Checkbox } from '../shared/FormStyles';
import Modal from '../shared/Modal';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: Omit<Goal, 'id'>) => void;
}

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

const DAYS_MAP = {
  'Domingo': 'Sunday',
  'Segunda': 'Monday',
  'Terça': 'Tuesday',
  'Quarta': 'Wednesday',
  'Quinta': 'Thursday',
  'Sexta': 'Friday',
  'Sábado': 'Saturday'
};

export default function AddGoalModal({ isOpen, onClose, onAdd }: AddGoalModalProps) {
  const [formData, setFormData] = useState({
    description: '',
    importance: '',
    startDate: new Date(),
    targetDate: new Date(),
    amount: '',
    workdays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    status: 'waiting' as Goal['status']  // Define o status padrão como "waiting"
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculateWorkDays = () => {
    if (!formData.amount || !formData.startDate || !formData.targetDate || formData.workdays.length === 0) {
      return { dailySavings: 0, totalWorkDays: 0 };
    }

    try {
      const amount = parseFloat(formData.amount.replace(/\./g, '').replace(',', '.'));
      if (isNaN(amount)) return { dailySavings: 0, totalWorkDays: 0 };

      let workDays = 0;
      let currentDate = new Date(formData.startDate);
      const targetDate = new Date(formData.targetDate);

      while (currentDate <= targetDate) {
        const dayName = format(currentDate, 'EEEE');
        const localizedDayName = Object.entries(DAYS_MAP).find(([_, value]) => value === dayName)?.[0];
        
        if (localizedDayName && formData.workdays.includes(localizedDayName)) {
          workDays++;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        dailySavings: workDays > 0 ? amount / workDays : 0,
        totalWorkDays: workDays
      };
    } catch (error) {
      console.error('Error calculating work days:', error);
      return { dailySavings: 0, totalWorkDays: 0 };
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    if (!formData.importance.trim()) {
      newErrors.importance = 'Importância é obrigatória';
    }
    if (!formData.amount) {
      newErrors.amount = 'Valor é obrigatório';
    }
    if (formData.workdays.length === 0) {
      newErrors.workdays = 'Selecione pelo menos um dia de trabalho';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      onAdd({
        description: formData.description,
        importance: formData.importance,
        startDate: format(formData.startDate, 'yyyy-MM-dd'),
        targetDate: format(formData.targetDate, 'yyyy-MM-dd'),
        amount: parseFloat(formData.amount.replace(/\./g, '').replace(',', '.')),
        workdays: formData.workdays.map(day => DAYS_MAP[day as keyof typeof DAYS_MAP]),
        status: formData.status
      });
      onClose();
    } catch (error) {
      console.error('Error adding goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkday = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workdays: prev.workdays.includes(day)
        ? prev.workdays.filter(d => d !== day)
        : [...prev.workdays, day],
    }));
  };

  const { dailySavings, totalWorkDays } = calculateWorkDays();

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pronto para decolar?"
      subtitle="Preencha os campos para registrar corretamente."
    >

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <FormLabel htmlFor="description" required>Descrição do Sonho</FormLabel>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="ex: Comprar um carro novo"
              error={errors.description}
              required
            />
          </div>

          <div>
            <FormLabel htmlFor="importance" required>Por que isso é importante?</FormLabel>
            <Input
              id="importance"
              value={formData.importance}
              onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
              placeholder="O que alcançar esse sonho significa para você?"
              error={errors.importance}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="startDate" required>Data de Início</FormLabel>
              <DatePicker
                id="startDate"
                value={formData.startDate}
                onChange={(date) => setFormData({ ...formData, startDate: date })}
                required
              />
            </div>
            <div>
              <FormLabel htmlFor="targetDate" required>Data Alvo</FormLabel>
              <DatePicker
                id="targetDate"
                value={formData.targetDate}
                onChange={(date) => setFormData({ ...formData, targetDate: date })}
                required
              />
            </div>
          </div>

          <div>
            <FormLabel htmlFor="amount" required>Valor do Sonho</FormLabel>
            <CurrencyInput
              value={formData.amount}
              onChange={(value) => setFormData({ ...formData, amount: value })}
              error={errors.amount}
              required
            />
          </div>

          <div>
            <FormLabel required>Dias de Trabalho</FormLabel>
            <div className="grid grid-cols-4 gap-2">
              {DAYS_OF_WEEK.map((day, index) => (
                <Checkbox
                  key={day}
                  id={`workday-${day}`}
                  label={day}
                  checked={formData.workdays.includes(day)}
                  onChange={() => toggleWorkday(day)}
                  className={`text-xs`}
                />
              ))}
            </div>
            {errors.workdays && (
              <p className="mt-1 text-sm text-red-500">{errors.workdays}</p>
            )}
          </div>

          {dailySavings > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Para atingir seu sonho até {format(formData.targetDate, 'dd/MM/yyyy')},
                você precisará economizar:
              </p>
              <p className="text-lg font-bold text-[#FF66B2] mt-1">
                {dailySavings.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })} por dia de trabalho
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Total de {totalWorkDays} dias de trabalho no período selecionado
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="flex items-center space-x-2"
            >
              <Check className="w-5 h-5" />
              <span>Adicionar Sonho</span>
            </Button>
          </div>
        </form>
      </Modal>
  );
}
