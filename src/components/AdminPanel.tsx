import React, { useState, useMemo } from 'react';
import { usePartyData } from '../context/PartyDataContext';
import { useTheme } from '../context/ThemeContext';
import {
  Swords,
  Users,
  Calendar,
  Target,
  Shield,
  Search,
  Trash2,
  CheckCircle2,
  MessageCircle,
  UserCheck,
  UserX,
  Mail,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { playClickSound } from '../lib/soundEffects';

export const AdminPanel: React.FC = () => {
  const { characters, deleteCharacter, approveUserAndCharacter, revokeUserApproval, approvedUsers, organizedParties, isAdmin } = usePartyData();
  const { themeConfig } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [cleaningDemos, setCleaningDemos] = useState(false);
  const [purgingAll, setPurgingAll] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState<'pending' | 'whitelist' | 'history'>('pending');
  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pendingCharacters = useMemo(() => {
    return characters.filter((c) => !c.approved);
  }, [characters]);

  const approvedUsersWithDetails = useMemo(() => {
    return approvedUsers.map((u) => {
      const userChars = characters.filter(
        (c) => c.ownerId === u.uid || (c.ownerEmail && u.email && c.ownerEmail.toLowerCase() === u.email.toLowerCase())
      );
      const whatsapp = userChars.find((c) => c.whatsappNumber)?.whatsappNumber || '';
      return {
        ...u,
        characters: userChars,
        whatsappNumber: whatsapp,
      };
    });
  }, [approvedUsers, characters]);

  const filteredApprovedUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return approvedUsersWithDetails;
    return approvedUsersWithDetails.filter((u) => {
      const matchEmail = (u.email || '').toLowerCase().includes(term);
      const matchWhatsapp = (u.whatsappNumber || '').toLowerCase().includes(term);
      const matchChars = (u.characters || []).some((c: any) => 
        (c.characterName || '').toLowerCase().includes(term) ||
        (c.vocation || '').toLowerCase().includes(term)
      );
      return matchEmail || matchWhatsapp || matchChars;
    });
  }, [approvedUsersWithDetails, searchTerm]);

  // Handle clearing mock/demo characters
  const handleClearDemoChars = async () => {
    const demoNames = [
      'Lord Blaker',
      'Ailura Moonwhisper',
      'Ignis Pyroclast',
      'Silent Fletcher',
      'Thais Vanguard',
      'Master Kenshin'
    ].map(n => n.toLowerCase());

    const demosInDb = characters.filter((c) => demoNames.includes(c.characterName.toLowerCase()));

    if (demosInDb.length === 0) {
      alert('Nenhum personagem fictício de demonstração encontrado na base de dados ativa.');
      return;
    }

    if (!confirm(`Deseja realmente excluir permanentemente os ${demosInDb.length} personagens fictícios de demonstração de Kalibra?`)) {
      return;
    }

    setCleaningDemos(true);
    try {
      let count = 0;
      for (const char of demosInDb) {
        await deleteCharacter(char.id);
        count++;
      }
      alert(`Sucesso! ${count} personagens fictícios foram excluídos permanentemente.`);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir os personagens de demonstração.');
    } finally {
      setCleaningDemos(false);
    }
  };

  // Handle clearing all characters from database
  const handlePurgeAllChars = async () => {
    if (characters.length === 0) {
      alert('Nenhum personagem encontrado no banco de dados ativo.');
      return;
    }

    if (!confirm('💥 ATENÇÃO: Deseja realmente excluir ABSOLUTAMENTE TODOS os personagens cadastrados na plataforma? Isso não poderá ser desfeito!')) {
      return;
    }

    if (!confirm('⚠️ CONFIRMAÇÃO FINAL: Tem certeza absoluta? Todos os jogadores reais também perderão seus personagens cadastrados!')) {
      return;
    }

    setPurgingAll(true);
    try {
      let count = 0;
      for (const char of characters) {
        await deleteCharacter(char.id);
        count++;
      }
      alert(`Sucesso! Todos os ${count} personagens foram excluídos do banco de dados.`);
    } catch (err) {
      console.error(err);
      alert('Erro ao limpar todos os personagens.');
    } finally {
      setPurgingAll(false);
    }
  };

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
      {/* Bloco de Controle do Administrador */}
      <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-lg shadow-amber-950/10">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-gamer font-bold uppercase tracking-wider text-amber-400 block">Painel de Moderação ClickHunt</span>
          <h4 className="font-gamer font-bold text-slate-200 text-sm">Gerenciamento de Dados e Personagens</h4>
          <p className="text-[11px] text-slate-400 font-sans">
            Ferramentas para resetar e preparar a plataforma para o lançamento oficial com jogadores reais de Kalibra.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleClearDemoChars}
            disabled={cleaningDemos || purgingAll}
            className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 disabled:opacity-50 text-slate-200 hover:text-rose-400 font-gamer font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>{cleaningDemos ? 'Excluindo...' : 'Limpar Apenas Fictícios'}</span>
          </button>

          <button
            onClick={handlePurgeAllChars}
            disabled={cleaningDemos || purgingAll}
            className="flex-1 px-4 py-2.5 bg-rose-950/60 hover:bg-rose-600 border border-rose-500/40 disabled:opacity-50 text-rose-200 hover:text-white font-gamer font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>{purgingAll ? 'Limpando...' : 'Zerar Banco (Excluir Tudo!)'}</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs de Moderação */}
      <div className="flex border-b border-slate-800 gap-2 font-gamer overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => { playClickSound(); setAdminSubTab('pending'); }}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition cursor-pointer tracking-wider uppercase ${
            adminSubTab === 'pending'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Fila de Aprovação</span>
          <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-mono">
            {pendingCharacters.length}
          </span>
        </button>

        <button
          onClick={() => { playClickSound(); setAdminSubTab('whitelist'); }}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition cursor-pointer tracking-wider uppercase ${
            adminSubTab === 'whitelist'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>E-mails Aprovados (Whitelist)</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
            {approvedUsers.length}
          </span>
        </button>

        <button
          onClick={() => { playClickSound(); setAdminSubTab('history'); }}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition cursor-pointer tracking-wider uppercase ${
            adminSubTab === 'history'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Histórico de PTs</span>
          <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-mono">
            {organizedParties.length}
          </span>
        </button>
      </div>

      {/* Renders for Sub Tabs */}
      {adminSubTab === 'pending' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-gamer font-bold text-base text-slate-200 uppercase tracking-wide">
              Aprovação de Novos Jogadores ({pendingCharacters.length})
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Ao aprovar um personagem pela primeira vez, o e-mail do jogador correspondente será <strong>salvo na lista de confiança (Whitelist)</strong>. Ele ficará livre para cadastrar e alterar personagens sem precisar de aprovação futura.
            </p>
          </div>

          {pendingCharacters.length === 0 ? (
            <div className="hud-panel rounded-2xl p-12 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 animate-pulse" />
              <p className="font-gamer text-sm uppercase font-bold text-slate-200">Fila Limpa!</p>
              <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
                Não há nenhum novo personagem aguardando aprovação no momento. Todos os jogadores ativos foram validados!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-sans">
              {pendingCharacters.map((char) => {
                const cleanNumber = (char.whatsappNumber || '').replace(/\D/g, '');
                const fullNumber = cleanNumber.length <= 11 ? `55${cleanNumber}` : cleanNumber;
                const defaultMsg = encodeURIComponent(
                  `Olá ${char.characterName}! Aqui é o Eder da Missclick (ClickHunt). Vi seu cadastro do personagem ${char.vocation} nível ${char.level} na plataforma.`
                );
                const whatsappHref = cleanNumber ? `https://wa.me/${fullNumber}?text=${defaultMsg}` : null;

                return (
                  <div key={char.id} className="hud-panel rounded-2xl p-5 border border-amber-500/20 flex flex-col justify-between space-y-4 relative overflow-hidden bg-slate-950/40">
                    <div className="absolute top-0 right-0 h-[2px] w-full bg-gradient-to-r from-amber-500 to-yellow-400" />
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 block truncate" title={char.ownerEmail}>
                          E-MAIL: {char.ownerEmail}
                        </span>
                        <h4 className="font-gamer font-bold text-base text-slate-100 mt-1 truncate">
                          {char.characterName}
                        </h4>
                        <p className="text-xs text-amber-400 font-mono font-bold uppercase mt-0.5">
                          {char.vocation} • Nível {char.level}
                        </p>
                      </div>

                      <div className="text-xs text-slate-400 font-sans space-y-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate"><strong className="text-slate-300">WhatsApp:</strong> {char.whatsappNumber || 'Não inf.'}</div>
                          {whatsappHref && (
                            <a
                              href={whatsappHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => playClickSound()}
                              className="inline-flex items-center gap-1 text-[10px] font-gamer font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 px-2 py-0.5 rounded-lg transition shrink-0 shadow-sm cursor-pointer"
                              title="Conversar com jogador no WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>Conversar</span>
                            </a>
                          )}
                        </div>
                        <div className="truncate"><strong className="text-slate-300">Hunts:</strong> {(char.huntsInterest || []).map(h => typeof h === 'string' ? h : (h as any).name).join(', ') || 'Não inf.'}</div>
                        <div className="truncate"><strong className="text-slate-300">Horários:</strong> {(char.availablePeriods || []).join(', ') || 'Não inf.'}</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      {errorMessage && (confirmApproveId === char.id || confirmDeleteId === char.id) && (
                        <span className="text-[10px] text-rose-400 block font-sans text-center">{errorMessage}</span>
                      )}

                      {confirmApproveId === char.id ? (
                        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5 space-y-2">
                          <div className="text-[10px] font-gamer font-bold text-emerald-400 uppercase text-center">Confirmar Whitelist?</div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                playClickSound();
                                try {
                                  setErrorMessage(null);
                                  await approveUserAndCharacter(char.id);
                                  setConfirmApproveId(null);
                                } catch (err: any) {
                                  console.error(err);
                                  setErrorMessage(`Erro: ${err.message || err}`);
                                }
                              }}
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-gamer font-bold text-[10px] uppercase tracking-wider rounded-lg transition cursor-pointer"
                            >
                              Sim, Aprovar!
                            </button>
                            <button
                              onClick={() => { playClickSound(); setConfirmApproveId(null); setErrorMessage(null); }}
                              className="px-3 py-1.5 bg-slate-900 text-slate-300 hover:bg-slate-800 font-gamer font-bold text-[10px] uppercase rounded-lg transition cursor-pointer border border-slate-800"
                            >
                              Voltar
                            </button>
                          </div>
                        </div>
                      ) : confirmDeleteId === char.id ? (
                        <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-2.5 space-y-2">
                          <div className="text-[10px] font-gamer font-bold text-rose-400 uppercase text-center">Rejeitar e Excluir?</div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                playClickSound();
                                try {
                                  setErrorMessage(null);
                                  await deleteCharacter(char.id);
                                  setConfirmDeleteId(null);
                                } catch (err: any) {
                                  console.error(err);
                                  setErrorMessage(`Erro: ${err.message || err}`);
                                }
                              }}
                              className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-gamer font-bold text-[10px] uppercase tracking-wider rounded-lg transition cursor-pointer"
                            >
                              Sim, Deletar!
                            </button>
                            <button
                              onClick={() => { playClickSound(); setConfirmDeleteId(null); setErrorMessage(null); }}
                              className="px-3 py-1.5 bg-slate-900 text-slate-300 hover:bg-slate-800 font-gamer font-bold text-[10px] uppercase rounded-lg transition cursor-pointer border border-slate-800"
                            >
                              Voltar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              playClickSound();
                              setConfirmApproveId(char.id);
                              setConfirmDeleteId(null);
                              setErrorMessage(null);
                            }}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-gamer font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Aprovar</span>
                          </button>

                          {whatsappHref && (
                            <a
                              href={whatsappHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => playClickSound()}
                              className="px-3.5 py-2 bg-emerald-950/60 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/40 hover:border-emerald-500 rounded-xl transition cursor-pointer flex items-center justify-center shadow"
                              title={`Falar com ${char.characterName} no WhatsApp`}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}

                          <button
                            onClick={() => {
                              playClickSound();
                              setConfirmDeleteId(char.id);
                              setConfirmApproveId(null);
                              setErrorMessage(null);
                            }}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 rounded-xl transition cursor-pointer flex items-center justify-center"
                            title="Rejeitar e Deletar Cadastro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {adminSubTab === 'whitelist' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-gamer font-bold text-lg text-slate-200 flex items-center gap-2 uppercase tracking-wide">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Jogadores Verificados / Whitelist ({approvedUsers.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Lista de todos os e-mails e contas autorizadas permanentemente. Estes jogadores criam e editam personagens sem precisar passar por fila.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por e-mail, char ou whatsapp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition font-sans"
              />
            </div>
          </div>

          {filteredApprovedUsers.length === 0 ? (
            <div className="hud-panel rounded-2xl p-12 text-center text-slate-500 space-y-2">
              <UserCheck className="w-10 h-10 mx-auto text-slate-600" />
              <p className="font-gamer text-sm uppercase font-bold text-slate-300">Nenhum jogador na Whitelist</p>
              <p className="text-xs text-slate-500 font-sans">
                {searchTerm
                  ? 'Nenhum resultado corresponde à sua pesquisa.'
                  : 'Quando você aprovar novos jogadores na Fila de Aprovação, o e-mail deles aparecerá aqui permanentemente com o botão direto de WhatsApp.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-sans">
              {filteredApprovedUsers.map((userItem) => {
                const cleanNumber = (userItem.whatsappNumber || '').replace(/\D/g, '');
                const fullNumber = cleanNumber.length <= 11 ? `55${cleanNumber}` : cleanNumber;
                const defaultMsg = encodeURIComponent(
                  `Olá! Aqui é o Eder da Missclick (ClickHunt). Entrando em contato sobre sua conta (${userItem.email}).`
                );
                const whatsappHref = cleanNumber ? `https://wa.me/${fullNumber}?text=${defaultMsg}` : null;
                const isRevoking = confirmRevokeId === userItem.uid;

                return (
                  <div
                    key={userItem.uid}
                    className="p-5 bg-slate-950/80 border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl space-y-4 transition relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="absolute top-0 right-0 h-[2px] w-full bg-gradient-to-r from-emerald-500 to-teal-400" />

                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-gamer font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4 shrink-0" />
                            <span>Membro Verificado</span>
                          </div>
                          <h4 className="font-sans font-bold text-slate-100 text-sm truncate" title={userItem.email}>
                            {userItem.email}
                          </h4>
                        </div>
                      </div>

                      {/* Character and Whatsapp info */}
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                        {/* Personagens */}
                        <div>
                          <span className="text-[10px] font-gamer font-bold text-slate-400 uppercase block mb-1">
                            Personagens Ativos ({(userItem.characters || []).length}):
                          </span>
                          {(userItem.characters || []).length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {(userItem.characters || []).map((c: any) => (
                                <span
                                  key={c.id}
                                  className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-200 text-[11px] font-mono flex items-center gap-1"
                                >
                                  <strong>{c.characterName}</strong>
                                  <span className="text-amber-400 text-[10px]">{c.vocation?.slice(0, 3)} {c.level}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">Nenhum char ativo no momento</span>
                          )}
                        </div>

                        {/* WhatsApp */}
                        <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-slate-400 font-sans truncate">
                            <strong className="text-slate-300 font-gamer text-[10px] uppercase">WhatsApp:</strong>{' '}
                            {userItem.whatsappNumber || 'Não informado'}
                          </span>
                        </div>
                      </div>

                      {/* Audit Date */}
                      <div className="text-[10px] text-slate-500 font-mono">
                        Aprovado em: {userItem.approvedAt ? new Date(userItem.approvedAt).toLocaleDateString('pt-BR') : 'Data não reg.'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-900 flex flex-col gap-2">
                      {isRevoking ? (
                        <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-2.5 space-y-2">
                          <div className="text-[10px] font-gamer font-bold text-rose-400 uppercase text-center">
                            Revogar acesso do jogador?
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                playClickSound();
                                try {
                                  await revokeUserApproval(userItem.uid);
                                  setConfirmRevokeId(null);
                                } catch (err: any) {
                                  console.error(err);
                                }
                              }}
                              className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-gamer font-bold text-[10px] uppercase tracking-wider rounded-lg transition cursor-pointer"
                            >
                              Sim, Revogar!
                            </button>
                            <button
                              onClick={() => { playClickSound(); setConfirmRevokeId(null); }}
                              className="px-3 py-1.5 bg-slate-900 text-slate-300 hover:bg-slate-800 font-gamer font-bold text-[10px] uppercase rounded-lg transition cursor-pointer border border-slate-800"
                            >
                              Voltar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          {whatsappHref ? (
                            <a
                              href={whatsappHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => playClickSound()}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-gamer font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                              title={`Chamar ${userItem.email} no WhatsApp`}
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>Chamar no WhatsApp</span>
                            </a>
                          ) : (
                            <div className="flex-1 py-2 bg-slate-900 text-slate-500 font-gamer font-bold text-[11px] uppercase tracking-wider rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 select-none">
                              <MessageCircle className="w-3.5 h-3.5 opacity-40" />
                              <span>Sem WhatsApp</span>
                            </div>
                          )}

                          <button
                            onClick={() => {
                              playClickSound();
                              setConfirmRevokeId(userItem.uid);
                            }}
                            className="px-3 py-2 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 rounded-xl transition cursor-pointer flex items-center justify-center"
                            title="Revogar Acesso / Remover da Whitelist"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {adminSubTab === 'history' && (
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
      )}
    </div>
  );
};
