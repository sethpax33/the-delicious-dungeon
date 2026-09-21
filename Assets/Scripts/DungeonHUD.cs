using UnityEngine;
using UnityEngine.UI;
public static class DungeonHUD
{
    static Text stats,message; static float timer;
    public static void Create(){
        var g=new GameObject("HUD");var c=g.AddComponent<Canvas>();c.renderMode=RenderMode.ScreenSpaceOverlay;g.AddComponent<CanvasScaler>();g.AddComponent<GraphicRaycaster>();
        stats=Make(c.transform,new Vector2(24,-24),24);message=Make(c.transform,new Vector2(0,-70),22);message.alignment=TextAnchor.UpperCenter;Refresh();
    }
    static Text Make(Transform p,Vector2 pos,int size){var g=new GameObject("HUDText");g.transform.SetParent(p,false);var t=g.AddComponent<Text>();t.font=Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");t.fontSize=size;t.color=Color.white;t.rectTransform.anchorMin=new Vector2(0,1);t.rectTransform.anchorMax=new Vector2(0,1);t.rectTransform.pivot=new Vector2(0,1);t.rectTransform.anchoredPosition=pos;t.rectTransform.sizeDelta=new Vector2(1000,100);return t;}
    public static void Refresh(){if(stats==null||DungeonGame.Instance==null)return;var p=DungeonGame.Instance.Player;stats.text=$"HP {Mathf.CeilToInt(p.health)}/{Mathf.CeilToInt(p.maxHealth)}\nIngredients {DungeonGame.Instance.Ingredients}   Coins {DungeonGame.Instance.Coins}\nKills {DungeonGame.Instance.DungeonKills}   Attack x{DungeonGame.Instance.DamageMultiplier:0.00}";}
    public static void ShowMessage(string s){if(message==null)return;message.text=s;timer=3f;}
}