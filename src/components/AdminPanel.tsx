import React, { useState, useMemo } from 'react';
import { usePartyData } from '../context/PartyDataContext';
import { useTheme } from '../context/ThemeContext';
import { Swords, Users, Calendar, Target, Shield, Search, Trash2 } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { playClickSound } from '../lib/soundEffects';

export const AdminPanel: React.FC = () => {
  const { organizedParties, isAdmin } = usePartyData();
  const { themeConfig } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  // Handle deleting/clearing an audit log record
  const handleDeleteLog = async (id: string) => {
    if (!confirm('Deseja excluir este registro do histórico permanentemente?')) return;
    playClickSound();
    try {
      await deleteDoc(doc(db, 'organized_parties', id));
    } catch (err) {
      console.error('Error deleting organized party log:', err);
    }
  };

  const filteredLogs = useMemo(() => {
    return organizedParties.filter((p) => {
      const term = searchTerm.toLowerCase();
      if (!term) return true;
      const matchesLeader = (p.leaderCharName || '').toLowerCase().includes(term);
      const matchesHunt = (p.huntTarget || '').toLowerCase().includes(term);
      const matchesMembers = (p.members || []).some((m: any) => 
        (m.characterName || '').toLowerCase().includes(term)
      );
      return matchesLeader || matchesHunt || matchesMembers;
    });
  }, [organizedParties, searchTerm]);

  if (!isAdmin) {
    return (
      <div className="hud-panel rounded-2xl p-8 text-center space-y-4">
        <Shield className="w-12 h-12 mx-auto text-rose-500" />
        <h3 className="font-gamer font-bold text-lg text-slate-100 uppercase">Acesso Restrito</h3>
        <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
          Esta área é reservada para administradores do ClickHunt. Autentique-se com a conta correspondente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-gamer font-bold text-lg text-slate-200 flex items-center gap-2 uppercase tracking-wide">
            <Shield className="w-5 h-5 text-amber-500" />
            Histórico de PTs Organizadas (Sessão Admin)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Acompanhe em tempo real todos os grupos de 4-man, 5-man e duos formados com sucesso na plataforma.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por líder, hunt ou membro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition font-sans"
          />
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="hud-panel rounded-2xl p-12 text-center text-slate-500 space-y-2">
          <Users className="w-10 h-10 mx-auto text-slate-600" />
          <p className="font-gamer text-sm uppercase font-bold text-slate-300">Nenhum registro encontrado</p>
          <p className="text-xs text-slate-500 font-sans">Nenhuma party foi organizada ainda ou os termos de busca não retornaram resultados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-5 bg-slate-950/80 border border-slate-800/90 rounded-2xl space-y-4 hover:border-slate-700/80 transition relative overflow-hidden"
            >
              {/* Corner Badge */}
              <div 
                className="absolute top-0 right-0 px-3 py-1 text-[10px] font-gamer font-bold uppercase tracking-wider rounded-bl-xl border-l border-b border-slate-800"
                style={{
                  backgroundColor: `${themeConfig.primaryColor}15`,
                  color: themeConfig.primaryColor,
                  borderColor: `${themeConfig.primaryColor}30`
                }}
              >
                {log.targetSize === 2 ? 'DUO MATCH' : `${log.targetSize}-MAN FULL`}
              </div>

              {/* Title & Info */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-gamer font-bold text-slate-100 text-sm">{log.leaderCharName}</span>
                  <span className="text-[10px] font-gamer font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">LÍDER</span>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="font-medium text-slate-300 truncate" title={log.huntTarget}>{log.huntTarget}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate" title={log.scheduledTime}>{log.scheduledTime}</span>
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800/80 space-y-2">
                <div className="text-[10px] font-gamer font-bold text-slate-500 uppercase tracking-wide">INTEGRANTES DO GRUPO:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(log.members || []).map((m: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-0.5 border-b border-slate-800/40 last:border-b-0">
                      <span className="font-semibold text-slate-300 truncate max-w-[120px]" title={m.characterName}>
                        {m.characterName}
                      </span>
                      <div className="flex items-center gap-1.5 ml-2">
                        {m.vocation && (
                          <span className="text-[10px] font-gamer font-bold text-slate-500 uppercase">
                            {m.vocation.slice(0, 3)}
                          </span>
                        )}
                        {m.level > 0 && (
                          <span className="font-mono font-bold text-amber-400 text-[10px]">
                            L.{m.level}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Audit Info */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                <span>Organizado em: {new Date(log.organizedAt).toLocaleString('pt-BR')}</span>
                <button
                  onClick={() => handleDeleteLog(log.id)}
                  className="text-slate-600 hover:text-rose-400 transition p-1 rounded hover:bg-slate-900"
                  title="Excluir do histórico"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
